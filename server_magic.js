var fs    = require('fs'),
    sys   = require('sys'),
    spawn = require('child_process').spawn,
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

  function spawnTask() {
    //TODO Move this path to the JSON file
    var tail = spawn('tail', ['-F', '-n', '0', 'httpd/logs/error_log']);
    tail.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    tail.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    tail.on('close', function (code) {
      console.log('Tail process exited with code ' + code);
    });
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
    watch.watchTree(perl_path, function (f, curr, prev) {
      if (typeof f == 'object' && prev === null && curr == null) {
        // Finished Waling the tree
      } else {
        exec(config.commands.server_stop, serverTask);
        exec(config.commands.server_clean, serverTask);
        console.log(config.commands.server_start);
        exec(config.commands.server_start, serverTask);
        spawnTask();
      }

    });

    // JS
    watch.watchTree(js_path, function (f, curr, prev) {
      if (typeof f == 'object' && prev === null && curr == null) {
        // Finished Waling the tree
      } else if (curr.nlink === 0) {
          console.log(f + ' has been removed');
      } else {
          console.log(f + ' has been changed');
          exec(code_min, serverTask);
      }
    });

    // CSS
    watch.watchTree(css_path, function (f, curr, prev) {
      if (typeof f == 'object' && prev === null && curr == null) {
        // Finished Waling the tree
      } else if (curr.nlink === 0) {
          console.log(f + ' has been removed');
      } else {
        console.log(f + ' has been changed');
        exec(code_min, serverTask);
      }
    });

  }


  config = JSON.parse(fs.readFileSync('./config/msc-task-runner.json'), 'utf8');
  monitor(config);
  exec('newgrp msfleet', serverTask );
  exec(config.commands.server_start, serverTask);
  spawnTask();
