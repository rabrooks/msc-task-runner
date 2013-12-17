var fs    = require('fs'),
    sys   = require('sys'),
    exec  = require('child_process').exec,
    watch = require(__dirname + '/watch/main.js'),
    config;

  function serverTask(error, stdout, stderr) {
    if (stdout) {
      sys.puts(stdout);
    } else if (stderr) {
      sys.puts(stderr);
    } else if (error) {
      sys.puts(error);
    }
  }

  function isValidFile(value, regex_array) {
    var regex, regex_obj;
    for ( regex in regex_array ) {
      regex_obj = new RegExp(regex_array[regex]);
      if (regex_obj.test(value)) {
        return true;
      }
    }
    return false;
  }


  function filterFiles(files, regex_array) {
    var file;
    for (file in files) {
      if (!isValidFile(file, regex_array)) {
        delete files[file]; // remove the file if it doesn't match
      }
    }
    return files;
  }

  function monitor (config) {
    var perl_path = config.files.perl.path,
        js_path   = config.files.js.path,
        css_path  = config.files.css.path;

    // Perl
    watch.createMonitor(perl_path, function (monitor) {
      monitor.files[perl_path];

      // purge any files that don't match the user's desired extension set
      if ( typeof config.files.perl.extensions === 'object' ) {
          monitor.files = filterFiles( monitor.files,
                          config.files.perl.extensions );
      }

      monitor.on("created", function (f, stat) {
        if ( isValidFile(f, config.files.perl.extensions) ) {
          monitor.files[f] = stat;
          console.log('Perl file has been created');
          console.log(config.commands.server_stop);
          //exec(config.commands.server_stop, serverTask);
          console.log(config.commands.server_start);
          //exec(config.commands.server_start, serverTask);
        }
      });

      monitor.on("changed", function (f, curr, prev) {
        console.log('Perl file has been changed');
          console.log(config.commands.server_stop);
          exec(config.commands.server_stop, serverTask);
          setTimeout((function() {
            console.log(config.commands.server_start);
              exec(config.commands.server_start, serverTask);
          }), 2000);
      });

      monitor.on("removed", function (f, stat) {
        delete monitor.files[f];
        console.log('Perl file has been removed');
        exec(config.commands.server_stop, serverTask);
        exec(config.commands.server_start, serverTask);
      });
    });

    // JS
    watch.createMonitor(js_path, function (monitor) {
      var code_min = config.commands.minify;
      monitor.files[js_path];

      // purge any files that don't match the user's desired extension set
      if ( typeof config.files.js.extensions === 'object' ) {
        monitor.files = filterFiles( monitor.files,
                                config.files.js.extensions );
      }

      monitor.on("created", function (f, stat) {
        if ( isValidFile(f, config.files.js.extensions) ) {
          monitor.files[f] = stat;
          console.log(f + ' has been created');
          exec(code_min, serverTask);
        }
      });

      monitor.on("changed", function (f, curr, prev) {
        console.log(f + ' has been changed');
        exec(code_min, serverTask);
      });

      monitor.on("removed", function (f, stat) {
        console.log(f + ' has been removed');
        exec(code_min, serverTask);
      });
    });

    // CSS
    watch.createMonitor(css_path, function (monitor) {
      var code_min = config.commands.minify ;
      monitor.files[css_path]

      // purge any files that don't match the user's desired extension set
      if ( typeof config.files.css.extensions === 'object' ) {
          monitor.files = filterFiles( monitor.files,
                          config.files.css.extensions );
      }

      monitor.on("created", function (f, stat) {
        console.log(f + ' has been created');
        console.log(monitor.files);
        exec(code_min, serverTask);
      });

      monitor.on("changed", function (f, curr, prev) {
        console.log(f + ' has been changed');
        console.log(monitor.files);
        exec(code_min, serverTask);
      });

      monitor.on("removed", function (f, stat) {
        console.log(f + ' has been removed');
        console.dir(monitor.files);
        exec(code_min, serverTask);
      });
    });

  }

  //exec('newgrp msfleet', serverTask );
  //exec(server_start, serverTask);
  config = JSON.parse(fs.readFileSync('./config/msc-task-runner.json'), 'utf8');
  monitor(config);
  exec(config.commands.watch_log, serverTask);
