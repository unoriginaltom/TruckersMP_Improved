$('body > div.wrapper > div.container.content.profile > div > div.col-md-9 > div > div:nth-child(4)').each(function () {
  var str = $(this).html();
  var regex = /((http|https):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/gi;
  var replaced_text = str.replace(regex, '<a href="$1" target="_blank" rel="noreferrer noopener" class="replaced">$1</a>');
  $(this).html(replaced_text);
});