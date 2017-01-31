
riot.tag2('candidate-tables', '<virtual each="{name in opts.names_selector}"> <h2>{name.original_name}</h2> <candidate-table ateji_selector="{name.atejiSelector}" syllable_changer="{parent.opts.syllable_changer}" show_comment="{show_comment}"></candidate-table> </virtual>', '', '', function(opts) {
this.show_comment = opts.show_comment;
});