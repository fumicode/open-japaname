var express = require('express');
var kanjihouse_router = module.exports = express.Router();

var mongoose = require('mongoose');
var KanjihouseMail = mongoose.model("KanjihouseMail");
var Japaname = mongoose.model("Japaname");
var Ateji = mongoose.model("Ateji");
var Kanji = mongoose.model("Kanji");
var atejilib = require("../core/atejilib");


//mongoose
//
var _ = require("underscore");
var path = require("path");

var co = require("co");

var nodemailer = require('nodemailer');

kanjihouse_router.get("/",(req,res,next)=>{
  co(function*(){
    var sent_mails = yield KanjihouseMail.find({sent:true}).sort({_id:-1}).limit(5).exec();
    var drafts = yield KanjihouseMail.find({sent:false}).sort({_id:-1}).limit(5).exec();

    //var japanames = yield Japaname.getLatestNames(5);
    var japanames = yield Japaname.findLatestNamesOfNamer(20, req.user._id).exec();

    res.render("kanjihouse/index", {
      drafts,
      sent_mails,
      japanames,
    });

  }).catch(e=>next(e));
});


kanjihouse_router.get("/japanames/",(req,res,next)=>{
  co(function*(){
    //var japanames = yield Japaname.findLatestNamesOfNamer(5,req.user._id).exec();

    var japanames = yield Japaname.findLatestNamesOfNamer(20, req.user._id).exec();
    res.render("kanjihouse/japanames", {japanames});
  }).catch(e=>next(e));

});


kanjihouse_router.get("/japanames/new",(req,res,next)=>{
  var action_url = path.join(req.baseUrl, req.url);
  res.render("kanjihouse/new_japaname",{action_url});
});


kanjihouse_router.post("/japanames/new",(req,res,next)=>{
  co(function*(){

    var names = JSON.parse(req.body.names);

    yield registerKanjisOfNames(names);

    //japaname を作る
    if(req.user && req.user._id){
      var newJapaname = yield Japaname.createNew(names, req.user._id);
    }
    else{
      var newJapaname = yield Japaname.createNew(names);
    }

    req.flash("success", "Japaname が保存されました");
    res.redirect(path.join(req.baseUrl , "japanames", newJapaname.code)); //短縮URL

  }).catch(e=>next(e));

});


function registerKanjisOfNames(names){
  return co(function*(){
    //漢字を辞書に登録する  

    for(let index in names){
      let name = names[index];
      console.log(name);
      for(let atemoji_index in name.atejis){
        let atemoji = name.atejis[atemoji_index];
        let kanji = atemoji.kanji;
        let meanings = atemoji.meanings;
        let kana = atemoji.kana;

        if(atejilib.isKatakanas(kana)){
          kana = atejilib.katakanasToHiraganas(kana);
        }

        yield registerKanji(kanji,[kana], meanings);
      }
    }
  });
}


function registerKanji(kanji, sounds, meanings){
  return co(function*(){
    var kanji_obj = yield Kanji.findById(kanji);

    //存在する場合は、当たらしい音と意味を追加する
    if(kanji_obj){
      console.log(kanji + " found");
      console.log("updating kanji sounds and meanings");
      kanji_obj.sounds  = _.union(kanji_obj.sounds,sounds);
      kanji_obj.meanings= _.union(kanji_obj.meanings,meanings);

    }
    else{
      console.log(kanji + " not found");
      console.log("creating kanji ");

      kanji_obj = new Kanji({
        _id:kanji,
        sounds:sounds,
        meanings:meanings
      });
    }


    var result = yield kanji_obj.save();


    return result;
  });
}



kanjihouse_router.get("/japanames/:japaname_code",(req,res,next)=>{
  co(function*(){
    var japaname_code = req.params.japaname_code;

    var japaname = yield Japaname.findByCode(japaname_code).exec();

    var action_url = path.join(req.baseUrl, req.url);

    res.render("kanjihouse/japaname", {action_url, japaname});
  }).catch(e=>next(e));
});


kanjihouse_router.post("/japanames/:japaname_code",(req,res,next)=>{
  co(function*(){
    let names = JSON.parse(req.body.names);
    let japaname_code = req.params.japaname_code;

    yield registerKanjisOfNames(names);

    var japaname = yield Japaname.findByCode(japaname_code);

    //!!!! 今は1個だけ！
    var saved_ateji = yield Ateji.createNew( names[0].atejis);

    japaname.names[0].original = names[0].original;
    japaname.names[0].ateji    = saved_ateji._id;


    yield japaname.save();

    req.flash("success", "Japaname が保存されました");
    res.redirect(path.join(req.baseUrl , "japanames", japaname.code)); 

  }).catch(e=>next(e));

})


var mail_template = require("../special/kanjihouse/mail_template.json");
var mail_info = require("../special/kanjihouse/mail_info.json");

kanjihouse_router.post("/cert_mail/make",(req,res,next)=>{
  co(function*(){

    var tos = req.body.tos;
    var name =  req.body.name;

    var tos_array = _(tos.split(/,/)).map(str=>str.trim()).filter(a=>!!a);

    console.log(tos_array);
    console.log(name);

    var newMail = new KanjihouseMail({
      tos:tos_array,
      name:name,
      title:mail_template.title,
      content:mail_template.content,
    });

    var mailDoc = yield newMail.save();
    console.log(mailDoc._id);

    var red_url = path.join(req.baseUrl, "cert_mail/drafts", mailDoc._id.toString())

    console.log("redirecting to " + red_url);
    res.redirect( red_url);

  }).catch(e=>next(e));
});


kanjihouse_router.get("/cert_mail/make",(req,res,next)=>{
  res.render("kanjihouse/cert_mail/make");
});

kanjihouse_router.get("/cert_mail/drafts",(req,res,next)=>{

  co(function*(){
    var mails = yield KanjihouseMail.find({sent:false}).sort({_id:-1}).exec();
    res.render("kanjihouse/cert_mail/drafts", {mails});
  }).catch(e=>next(e));

});

kanjihouse_router.get("/cert_mail/drafts/:mail_id",(req,res,next)=>{
  co(function*(){
    var mail_id = req.params.mail_id;
    var mail = yield KanjihouseMail.findById(mail_id)
      .populate({
        path:"japanames",
        populate:{
          path:"names.ateji names.kana"
        }
      })
      .exec();

    //var latest_japanames = yield Japaname.getLatestNames(10).exec();

    var latest_japanames = yield Japaname.findLatestNamesOfNamer(20, req.user._id).exec();
    /*
    var latest_japanames = 
      yield Japaname.findLatestNamesOfNamer(10, req.user._id).exec();
      */

    
    res.render("kanjihouse/cert_mail/draft", {
      mail,
      action_url:path.join(req.baseUrl, req.url),
      latest_japanames,
    });

  }).catch(e=>next(e));
});


//edit
kanjihouse_router.post("/cert_mail/drafts/:mail_id",(req,res,next)=>{
  co(function*(){
    var mail_id = req.params.mail_id;

    var the_mail = yield KanjihouseMail.findById(mail_id).exec();


    var tos = req.body.tos;
      var tos_array = _(tos.split(/,/)).map(str=>str.trim()).filter(a=>!!a);;

    var name =  req.body.name;
    var title =  req.body.title;
    var content =  req.body.content;

    try{
      console.log("parsing japanames ");
      console.log(req.body.japanames);

      var japanames = JSON.parse(req.body.japanames);
    }catch(e){

      var japanames = [];
    }

    var action =  req.body.action;

    the_mail.tos = tos_array;
    the_mail.name = name;
    the_mail.title = title;
    the_mail.content  = content;
    the_mail.japanames = japanames;

    if(action == "save"){
      var saved_mail = yield the_mail.save();
      var red_url = path.join(req.baseUrl, "cert_mail/drafts", the_mail._id.toString())
      console.log("redirecting to " + red_url);

      req.flash("success", "下書きを保存しました。");

      return res.redirect(red_url)
    }
    else if(action == "send"){
      //メール送信前しょり
      console.log("送信前処理中");

      //Japanameを送信するなど
      the_mail = yield beforeSend(the_mail);

      console.log("the_mail.content");
      console.log(the_mail.content);


      let mailOptions = {
        from: '"'+mail_info.name+'"<' + mail_info.mail + '>', // sender address
        to: the_mail.tos, // list of receivers
        subject: the_mail.title, // Subject line
        text: the_mail.content, // plain text body
        //html: the_mail.content // html body
      };

      let transporter = nodemailer.createTransport({
        host: mail_info.host,
        auth: {
          user: mail_info.mail,
          pass: mail_info.pass
        }
      });

      //メール送信しょり
      console.log("メールを送信しています");

      let info = yield sendMailPromise(transporter, mailOptions);

      console.log('Message %s sent: %s', info.messageId, info.response);
      the_mail.title;
      the_mail.sent = true;
      var saved_mail = yield the_mail.save();

      return res.render("kanjihouse/cert_mail/sent");
    }
    else{
      throw new Error("invalid action param");
    }
  }).catch(e=>next(e));
});


function sendMailPromise(transporter, mailOptions){
  return new Promise(function(resolve, reject){

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      }

      resolve(info);
    });
  });
}


function beforeSend(the_mail){
  return co(function*(){

    let pop_mail = yield the_mail
      .populate({
        path:"japanames",
        populate:{
          path:"names.ateji names.kana"
        }
      })
      .execPopulate();

    console.log(pop_mail.japanames);

    let japaname_url_lines = _(pop_mail.japanames).map((japaname)=>{

      return japaname.original + "\t" + japaname.string + "\t"+ "https://japana.me/" + japaname.code

    }).join("\n");

    console.log("japaname_url_lines");
    console.log(japaname_url_lines);

    pop_mail.content = 
      pop_mail.content.replace(/\[japaname_url_lines\]/, japaname_url_lines);

    return pop_mail;
  });
}


kanjihouse_router.get("/cert_mail/sent_mails",(req,res,next)=>{
  co(function*(){
    var mails = yield KanjihouseMail.find({sent:true}).sort({_id:-1}).exec();

    res.render("kanjihouse/cert_mail/sent_mails", {mails});

  }).catch(e=>next(e));

});

kanjihouse_router.get("/cert_mail/sent_mails/:mail_id",(req,res,next)=>{
  co(function*(){
    var mail_id = req.params.mail_id;

    var mail = yield KanjihouseMail.findById(mail_id).exec();

    res.render("kanjihouse/cert_mail/sent_mail", {
      mail,
    });

  }).catch(e=>next(e));
});
