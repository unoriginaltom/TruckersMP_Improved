console.log("STEAM friends list")

var friends = $('.friend_block_v2')
console.log(db.hasFailed())

var time = 0;
if (friends.length && !db.hasFailed()) {
  var button = `<button id="manage_friends_tmp" class="profile_friends manage_link btnv6_blue_hoverfade btn_medium"><span><img src="${chrome.extension.getURL('icons/favicon.png')}" width="10px"> Check</span></button>`
  $('button#add_friends_button').after(button)
  $('button#manage_friends_tmp').on('click', function () {
    if (confirm("It will send one request per user. Are you sure?")) {
      testAccounts()
    }
  })

  function testAccounts() {
    friends.each(function () {
      var steamID = $(this).data('steamid')
      var friend = $(this)

      setTimeout(function () {
        getPlayer(steamID).then(function (player) {
          if (typeof player !== 'object' || player.error) {
            return
          } else {
            var name = friend.find('div.friend_block_content')
            console.log(name)

            var banned = `<span class="tmp_count em_count banned_count">Banned</span>`

            name.append(`<div class="invite_block_details leftLongInviterSmallText">
          <span class="tmp_count ${player.groupName !== 'Player' ? 'em_count' : 'count'}">
            <img src="${chrome.extension.getURL('icons/favicon.png')}" width="10px"> <a href="https://truckersmp.com/user/${player.id}" target="_blank">${player.groupName}</a>
          </span>${player.banned ? banned : ''}</div>`)
          }
        })
      }, time)
      time += 100
    })
  }
}