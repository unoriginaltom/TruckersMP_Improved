// FirebaseUI config
var loginUIConfig = {
  callbacks: {
    // Called when the user has been successfully signed in.
    signInSuccess: function (user, credential, redirectUrl) {
      handleSignedInUser(user)
      // Do not redirect.
      return false
    }
  },
  signInFlow: 'popup',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
};

// Initialize FirebaseUI
var ui = new firebaseui.auth.AuthUI(firebase.auth())
var isSignedIn = false

function handleSignedInUser(user) {
  console.log(user)
}

function handleSignedInUser(user) {
  $('#firebaseui-auth').slideUp('fast');

  $('#firebaseui-logout').slideDown('fast');
  $('#user-details').slideDown('fast');
  $('input#storageIsOnline').click();

  isSignedIn = true
}

function handleSignedOutUser() {
  ui.start('div#firebaseui-auth', loginUIConfig)
  $('#firebaseui-auth').slideDown('fast');

  $('#firebaseui-logout').slideUp('fast');
  $('#user-details').slideUp('fast');
  $('input#storageIsLocal').click();

  isSignedIn = false
}

firebase.auth().onAuthStateChanged(function (user) {
  user ? handleSignedInUser(user) : handleSignedOutUser()

  if (user) {
    $('#account-username').text(user.displayName);
    $('#account-image').attr('src', user.photoURL)

    $('#account-provider').text('uses ' + providersData(user.providerData));

    $('#account-details').text(JSON.stringify(user, null, '  '));
  } else {
    $('#sign-in-status').text('Signed out');
    $('#account-details').html('There is no data to show... But there is a cake! <img src="https://i.imgur.com/i4YAIoU.png" class="img-rounded">');
  }
})

function providersData(data) {
  var providers = []
  for (let index = 0; index < data.length; index++) {
    const provider = data[index];

    providers.push(provider.providerId)
  }

  return providers.join(' and ')
}

function initApp() {
  $('button#signOut').click(function () {
    if (confirm('Are you sure?\nOnline-stored information will NOT be deleted after signing out.')) {
      firebase.auth().signOut();
    }
  })
}

window.addEventListener('load', initApp);