
riot.tag2('candidate-table', '<table class="syllablesTable"> <tr class="syllablesTable__row" each="{cell in selected_cells}"> <td class="syllablesTable__cell">{cell.syllable.romaji} - {cell.syllable.kana} <ul class="kanjisList"> <li class="kanjisList__item" each="{ateji in cell.syllable.atejis}">{ateji.kanji} <div class="kanjisList__meanings">{ateji.meanings.join(⁗\\n⁗)}</div> </li> </ul> </td> </tr> </table>', 'candidate-table .syllablesTable,[riot-tag="candidate-table"] .syllablesTable,[data-is="candidate-table"] .syllablesTable{ } candidate-table .syllablesTable__row,[riot-tag="candidate-table"] .syllablesTable__row,[data-is="candidate-table"] .syllablesTable__row{ } candidate-table .syllablesTable__cell,[riot-tag="candidate-table"] .syllablesTable__cell,[data-is="candidate-table"] .syllablesTable__cell{ overflow-x:scroll; } candidate-table .kanjisList,[riot-tag="candidate-table"] .kanjisList,[data-is="candidate-table"] .kanjisList{ width:9999px; overflow:hidden; } candidate-table .kanjisList__item,[riot-tag="candidate-table"] .kanjisList__item,[data-is="candidate-table"] .kanjisList__item{ float:left; font-size:80px; text-align:center; margin:0 0.3em; } candidate-table .kanjisList__meanings,[riot-tag="candidate-table"] .kanjisList__meanings,[data-is="candidate-table"] .kanjisList__meanings{ font-size:20px; }', '', function(opts) {
    this.syllables = opts.syllables;
    this.syllables_table = opts.syllables_table;

    console.log( this.syllables);
    console.log( this.syllables_table);

    var this_tag = this;
    this.on("update", function(){
      this_tag.selected_cells = this_tag.syllables_table[0];
      console.log(this_tag.selected_cells);

    });
});