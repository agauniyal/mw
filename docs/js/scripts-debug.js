var projects = {
  data: [],
  limit: 30,
  offset: 0,
  end: false,
  inProgress: false
};


projects.list = new Clusterize({
  rows: projects.data,
  scrollId: 'app',
  contentId: 'contentArea',
  callbacks: {
    scrollingProgress: function(progress) {
      if (progress > 40) {
        var data = projects.fetchNext();
      }
    }
  }
});


projects.createMarkup = function(project) {
  var string = '<li><a href="';
  string += project.url;
  string += '" class="name">';
  string += project.name;
  string += '</a><p>';
  string += project.description;
  string += '</p></li>';
  return DOMPurify.sanitize(string);
};


projects.fetchNext = function() {
  if (projects.inProgress || projects.end) {
    return [];
  }

  projects.inProgress = true;
  projects.offset += projects.limit;
  fetch('https://mw.now.sh/api/projects?limit=' + projects.limit + '&offset=' + projects.offset, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(parseJson)
    .then(function(response) {
      if (!response.status) { return; }
      if (response.data.length < 1) {
        projects.end = true;
        return;
      }

      projects.inProgress = false;
      var len = response.data.length;
      var markupArray = [];
      for (var i = 0; i < len; ++i) {
        markupArray.push(projects.createMarkup(data[i]));
      }
      projects.list.append(markupArray);
    })
    .catch(function(err) {});
};


function parseJson(response) {
  if (response.status >= 200 && response.status < 300) {
    return response.json();
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}


window.onload = function() {
  fetch('https://mw.now.sh/api/projects?limit=50&offset=0', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(parseJson)
    .then(function(response) {
      var len = response.data.length;
      var markupArray = [];
      for (var i = 0; i < len; ++i) {
        markupArray.push(projects.createMarkup(response.data[i]));
      }
      projects.list.append(markupArray);

    }).catch(function(err) {
      swal({
        title: 'Oops!',
        text: 'Could not load data, Please reload page again!',
        confirmButtonText: 'Ok',
        type: 'error',
        showCancelButton: false
      });
    });
}


document.getElementById('addProject').onclick = function() {

  // set defaults
  swal.setDefaults({
    input: 'text',
    confirmButtonText: 'Next &rarr;',
    showCancelButton: true,
    type: 'info',
    allowOutsideClick: false,
    progressSteps: ['1', '2', '3', '4']
  });

  // make steps
  var steps = [{
      title: 'Library Name',
      inputValidator: function(value) {
        return new Promise(function(resolve, reject) {
          if (value.length > 0 && value.length < 50) {
            resolve();
          } else {
            return (value.length < 1) ?
              reject('Empty fields are not allowed') : reject('Limit of 50 characters exceeded');
          }
        })
      }
    },
    {
      title: 'Link to your project',
      text: 'Or relevant issue',
      input: 'url'
    },
    {
      title: 'Short description',
      text: 'No more than 500 chars',
      input: 'textarea',
      inputValidator: function(value) {
        return new Promise(function(resolve, reject) {
          if (value.length > 0 && value.length < 501) {
            resolve();
          } else {
            return (value.length < 1) ?
              reject('Empty fields are not allowed') : reject('Limit of 500 characters exceeded');
          }
        })
      }
    },
    {
      title: 'Email',
      text: 'Not required',
      inputValidator: function() {
        return new Promise(function(resolve, reject) { resolve(); });
      }
    }
  ];

  // process queue
  swal.queue(steps).then(function(result) {
    swal.resetDefaults();
    swal({
      title: 'Submit ' + result[0] + ' for review?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Submit'
    }).then(function() {
      fetch('https://mw.now.sh/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Name: result[0],
            Url: result[1],
            Description: result[2],
            Email: result[3]
          })
        })
        .then(function(response) {
          if (response.status === 200) {
            swal({
              title: 'Submitted for review successfully!',
              confirmButtonText: 'Perfect!',
              type: 'success',
              showCancelButton: false
            });
          } else {
            throw new Error(response.statusText);
          }
        }).catch(function(err) {
          swal({
            title: err.toString(),
            text: 'Could not submit data, please try again',
            confirmButtonText: 'Ok',
            type: 'error',
            showCancelButton: false
          });
        });

    });
  }, function() { swal.resetDefaults(); });
};
