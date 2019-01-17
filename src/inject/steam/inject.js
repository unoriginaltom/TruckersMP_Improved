console.log("STEAM profile")

var steamID = document.querySelector('#abuseForm > input[name=abuseID]');
var isCommunityID = false;

if (steamID) {
  steamID = steamID.value;
  isCommunityID = true;
} else {
  steamID = location.pathname.match(/^\/(?:id|profiles)\/([^\s/]+)\/?/)[1];
  isCommunityID = /^\/profiles/.test(location.pathname);
}

console.log(isCommunityID)
console.log(db.hasFailed())

if (isCommunityID && !db.hasFailed()) {
  getPlayer(steamID).then(function (player) {
    console.log(typeof player)
    var personaName = $('div.profile_content_inner');

    if (personaName.find('div.profile_leftcol').length) {
      personaName = personaName.find('div.profile_leftcol')
    }

    var tmpDiv;
    if (typeof player !== 'object' || player.error) {
      tmpDiv = `<div class="profile_customization" style="padding: 0 10px 0px 10px;"><div class="profile_customization_header">No TruckersMP account ¯\_(ツ)_/¯</div></div>`
    } else {
      var realBanned = player.bannedUntil
      if (player.banned & !player.bannedUntil) {
        realBanned = 'Permanent'
      } else if (player.bannedUntil) {
        realBanned = 'Until ' + player.bannedUntil + ' UTC'
      } else {
        realBanned = 'No'
      }

      tmpDiv = `
<div class="profile_customization">
  <div class="profile_customization_header">
    <img src="${chrome.extension.getURL('icons/favicon.png')}"> TruckersMP Info
  </div>

  <div class="profile_customization_block">
    <div class="favoriteguide_showcase">
      <div class="showcase_content_bg">
        <div class="workshop_showcase_item showcase_slot">
          <div class="myworkshop_showcase_header guides ${realBanned !== 'No' ? 'banned' : ''}">
            <div class="playerAvatar"><img src="${player.avatar}">
            </div>
            <a class="myworkshop_playerName" href="https://truckersmp.com/user/${player.id}" target="_blank">${player.name}</a>
          </div>

          <div class="workshop_showcase_item_details">
            <div class="showcase_content_bg showcase_stats_row">
              <div class="showcase_stat">
                <div class="label">
                  ID
                </div>

                <div class="value tmpValue">
                  ${player.id}
                </div>
              </div>

              <div class="showcase_stat">
                <div class="label">
                  Group
                </div>

                <div class="value tmpValue">
                  ${player.groupName}
                </div>
              </div>

              ${realBanned !== 'No' ? '</div><div class=\"showcase_content_bg showcase_stats_row\">' : ''}

              <div class="showcase_stat">
                <div class="label">
                  Banned
                </div>

                <div class="value tmpValue">
                  ${realBanned}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
      `
    }

    personaName.prepend(tmpDiv);
  })
}