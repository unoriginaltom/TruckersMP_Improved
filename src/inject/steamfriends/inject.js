console.log("STEAM pending friends")

var invites = $('.invite_row')
console.log(db.hasFailed())

if (invites.length && !db.hasFailed()) {
  invites.each(function () {
    var steamID = $(this).data('steamid')
    var invite = $(this)

    getPlayer(steamID).then(function (player) {
      if (typeof player !== 'object' || player.error) {
        return
      } else {
        var name = invite.find('a.linkTitle')

        var banned = `<span class="tmp_count em_count banned_count">Banned</span>`

        name.after(`<br><div class="invite_block_details leftLongInviterSmallText">
        <span class="tmp_count ${player.groupName !== 'Player' ? 'em_count' : 'count'}">
          <img src="${chrome.extension.getURL('icons/favicon.png')}" width="10px"> <a href="https://truckersmp.com/user/${player.id}" target="_blank">${player.groupName}</a>
        </span>${player.banned ? banned : ''}</div>`)
      }
    })
  })
}