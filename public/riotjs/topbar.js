
riot.tag2('topbar', '<div class="topbar"> <div class="topbar__container"> <table class="topbar__table"> <tr> <td class="topbar__cell topbar__cell--sitelogo">{drawLogo}<a href="/" if="{opts.drawLogo}"><img class="topbar__sitelogo" src="/images/japaname_logo_1024.png" alt="Go to top"></a></td> <td class="topbar__cell topbar__cell--search"> <div class="topbar__search {search_focused ? \'topbar__search--focused\':\'\'}"> <japaname-searchbox text="{opts.text}" if="{opts.drawSearchbox}" fontsize="3rem" height="100%" onfocus="{focused}" onblur="{blured}"></japaname-searchbox> </div> </td> <td class="topbar__cell topbar__cell--userinfo"> <div class="topbar__userinfo"> <virtual if="{opts.user}"><a href="/mypage">{opts.user.my_japaname && opts.user.my_japaname.string || opts.user.username}<span style="font-size:0.7em">様</span></a></virtual> <virtual if="{!opts.user}"><a href="/auth">Guest</a></virtual> </div> </td> </tr> </table> </div> </div>', '', '', function(opts) {
    this.focused = function(e){
      console.log("focused");
      this.search_focused = true;
      this.update();
    }.bind(this)

    this.blured = function(e){
      console.log("blured");
      this.search_focused = false;
      this.update();
    }.bind(this)
});