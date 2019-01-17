var db = new Dexie("TruckersMPImproved", 1);

db.version(1).stores({
  player: "&steamID64, lastCheck, error"
})

function dbPlayerGet(id) {
  return db.player.get(id, function (player) {
    return player
  })
}

function dbClearAll() {
  return db.player.clear()
}

function dbPlayerPut(player) {
  return db.player.put(player)
}

function getPlayer(id) {
  return dbPlayerGet(id).then(function (player) {
    // Check indexedDB
    return player;
  }).then(function (player) {
    // Check player existence in DB
    if (typeof player === 'object') {
      if (Math.floor(Date.now() / 1000) - 300 < player.lastCheck) {
        return player;
        console.log('TMP Improved (dexie/getPlayer)');
      } else {
        return tmpPlayer(id); // tmp api check + Store in indexedDB
      }
    } else {
      return tmpPlayer(id); // tmp api check + Store in indexedDB
    }
  })
}

function tmpPlayer(id) {
  console.log(id)
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: 'https://api.truckersmp.com/v2/player/' + id,
      type: 'GET',
      dataType: 'text',
      success: function (data) {
        console.log('TMP Improved (dexie/tmpPlayer)');
        data = JSON.parse(data.replace(/:([0-9]{15,}),/g, ':"$1",'))

        var player = data.response

        if (data.error) {
          player = {
            steamID64: id,
            error: true
          }
        } else {
          player.error = false
        }

        player.lastCheck = Math.floor(Date.now() / 1000)

        dbPlayerPut(player)
        resolve(player)
      },
      error: function (error) {
        reject(error)
      }
    })
  })
}