 var fs = require('fs'),
     sys = require('sys'),
     exec = require('child_process').exec,
     watch = require('./watch/main.js'),
     config = 'config.json',
     data;

  function serverTask(error, stdout, stderr) {
    sys.puts(stdout);
  }

  function minifyTask() {
    console.log('Running Minify');
  }

  exec("ls -a", serverTask);
  //serverTask('start');
  data = JSON.parse(fs.readFileSync(config));

  if (data.username) {
    monitor(data);
  } else {
    console.log('Sorry problem reading the JSON config file');
  }

  function monitor (data) {
    var user = data.username,
        perl_path = data.perl_path,
        javascript_path = data.javascript_path,
        css_path = data.css_path,
        code_min = 'echo min' ;
    // Perl
    watch.createMonitor(perl_path, function (monitor) {
      monitor.files[perl_path]
      monitor.on("created", function (f, stat) {
        console.log('Perl file or directory has been created');
        exec("server_stop", serverTask);

      })
      monitor.on("changed", function (f, curr, prev) {
        console.log('Perl file or directory has been changed');
        exec("server_stop", serverTask);
      })
      monitor.on("removed", function (f, stat) {
        console.log('Perl file or directory has been removed');
        exec("server_stop", serverTask);
      })
    })
    // JS
    watch.createMonitor(javascript_path, function (monitor) {
      monitor.files[javascript_path]
      monitor.on("created", function (f, stat) {
        console.log('JS File has been created');
        console.log(f);
         console.log(stat);
      })
      monitor.on("changed", function (f, curr, prev) {
        console.log('JS File has been changed');
        console.log(f);
      })
      monitor.on("removed", function (f, stat) {
        console.log('JS File has been removed');
      })
    })
    // // CSS
    watch.createMonitor(css_path, function (monitor) {
      monitor.files[css_path]
      monitor.on("created", function (f, stat) {
        console.log('CSS File has been created');
        console.log(f);
         console.log(stat);
      })
      monitor.on("changed", function (f, curr, prev) {
        console.log('CSS File has been changed');
        console.log(f);
      })
      monitor.on("removed", function (f, stat) {
        console.log('CSS File has been removed');
      })
    })

  }