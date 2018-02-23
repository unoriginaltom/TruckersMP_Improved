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
var isSignedIn = (firebase.auth().displayName) ? true : false

function handleSignedInUser(user) {
  console.log(user)

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

    $('#storageLoginState').text('uses ' + providersData(user.providerData));

    $('#collapseStorage').collapse('hide');
    $('#signOut').text('Sign out');
  } else {
    $('#sign-in-status').text('Signed out');
    $('#storageLoginState').text('Local');

    $('#collapseStorage').collapse('show');
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

  if (!firebase.auth().displayName) {
    $('#collapseStorage').collapse('show');
    $('#storageLoginState').text('Local');
  }
}

window.addEventListener('load', initApp);