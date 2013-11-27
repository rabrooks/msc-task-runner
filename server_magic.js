 var fs = require('fs'),
     sys = require('sys'),
     exec = require('child_process').exec,
     watch = require('./watch/main.js'),
     config = '/home/rabrooks/msc-task-runner/config.json',
     server_start = 'httpd/start',
     server_stop = 'httpd/stop',
     data;

  function serverTask(error, stdout, stderr) {
    if (stdout) {
      sys.puts(stdout);
    } else if (stderr) {
      sys.puts(stderr);
    } else if (error) {
      sys.puts(error);
    }
    console.log('The Command: ' + stdout + " Should Have Executed.")
  }
  exec('newgrp msfleet', serverTask );
  exec(server_start, serverTask);
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
        css_path = data.css_path;

    // Perl
    watch.createMonitor(perl_path, function (monitor) {
      monitor.files[perl_path]
      monitor.on("created", function (f, stat) {
        console.log('Perl file or directory has been created');
        exec(server_stop, serverTask);
        exec(server_start, serverTask);

      })
      monitor.on("changed", function (f, curr, prev) {
        console.log('Perl file or directory has been changed');
        exec(server_stop, serverTask);
        exec(server_start, serverTask);
      })
      monitor.on("removed", function (f, stat) {
        console.log('Perl file or directory has been removed');
        exec(server_stop, serverTask);
        exec(server_start, serverTask);
      })
    })
    // JS
    watch.createMonitor(javascript_path, function (monitor) {
      var code_min = data.minify;
      monitor.files[javascript_path]
      monitor.on("created", function (f, stat) {
        console.log('JS File has been created');
        exec(code_min, serverTask);
      })
      monitor.on("changed", function (f, curr, prev) {
        console.log('JS File has been changed');
        exec(code_min, serverTask);
      })
      monitor.on("removed", function (f, stat) {
        console.log('JS File has been removed');
        exec(code_min, serverTask);
      })
    })
    // // CSS
    watch.createMonitor(css_path, function (monitor) {
      var code_min = data.minify ;
      monitor.files[css_path]
      monitor.on("created", function (f, stat) {
        console.log('CSS File has been created');
        exec(code_min, serverTask);
      })
      monitor.on("changed", function (f, curr, prev) {
        console.log('CSS File has been changed');
        exec(code_min, serverTask);
      })
      monitor.on("removed", function (f, stat) {
        console.log('CSS File has been removed');
        exec(code_min, serverTask);
      })
    })

  }
