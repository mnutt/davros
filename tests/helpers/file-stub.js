import Pretender from 'pretender';

let baseDir = {
  "data": {
    "type": "files",
    "id": "/",
    "attributes": {
      "mode": 16888,
      "size": 4096,
      "mtime": "2015-11-14T04:13:16.248Z",
      "ctime": "2015-11-14T04:13:16.248Z",
      "path": "",
      "name": ""
    },
    "relationships": {
      "files": {
        "data": [
          {
            "type": "files",
            "id": "Welcome to Davros.md"
          },
          {
            "type": "files",
            "id": "myDir"
          },
          {
            "type": "files",
            "id": "space.jpg"
          },
          {
            "type": "files",
            "id": "voyager.jpg"
          }
        ]
      }
    }
  },
  "included": [
    {
      "type": "files",
      "id": "Welcome to Davros.md",
      "attributes": {
        "ctime": "2015-11-14T04:11:53.060Z",
        "mode": 33184,
        "mtime": "2015-11-14T04:11:53.060Z",
        "name": "Welcome to Davros.md",
        "path": "Welcome to Davros.md",
        "size": 1894
      }
    },
    {
      "type": "files",
      "id": "myDir",
      "attributes": {
        "ctime": "2015-11-14T04:13:32.188Z",
        "mode": 16872,
        "mtime": "2015-11-14T04:13:32.188Z",
        "name": "myDir",
        "path": "myDir",
        "size": 4096
      }
    },
    {
      "type": "files",
      "id": "space.jpg",
      "attributes": {
        "ctime": "2015-11-14T04:11:53.064Z",
        "mode": 33184,
        "mtime": "2015-11-14T04:11:53.064Z",
        "name": "space.jpg",
        "path": "space.jpg",
        "size": 378200
      }
    },
    {
      "type": "files",
      "id": "voyager.jpg",
      "attributes": {
        "ctime": "2015-11-14T04:11:53.064Z",
        "mode": 33184,
        "mtime": "2015-11-14T04:11:53.064Z",
        "name": "voyager.jpg",
        "path": "voyager.jpg",
        "size": 600996
      }
    }
  ]
};

let myDir = {
  "data": {
    "type": "files",
    "id": "myDir",
    "attributes": {
      "mode": 16872,
      "size": 4096,
      "mtime": "2015-11-14T04:13:32.188Z",
      "ctime": "2015-11-14T04:13:32.188Z",
      "path": "myDir",
      "name": "myDir"
    },
    "relationships": {
      "files": {
        "data": [
          {
            "type": "files",
            "id": "myDir/ios-davros.png"
          }
        ]
      }
    }
  },
  "included": [
    {
      "type": "files",
      "id": "myDir/ios-davros.png",
      "attributes": {
        "ctime": "2015-11-14T04:13:32.188Z",
        "mode": 33200,
        "mtime": "2015-11-14T04:13:32.184Z",
        "name": "ios-davros.png",
        "path": "myDir/ios-davros.png",
        "size": 218233
      }
    }
  ]
};

let spaceFile = {
  "data": {
    "type": "files",
    "id": "space.jpg",
    "attributes": {
      "mode": 33184,
      "size": 378200,
      "mtime": "2015-11-14T04:11:53.064Z",
      "ctime": "2015-11-14T04:11:53.064Z",
      "path": "space.jpg",
      "name": "space.jpg"
    }
  }
};

export default function() {
  return new Pretender(function() {
    let structure = {
      '/api/files/%2F': baseDir,
      '/api/files/myDir%2F': myDir,
      '/api/files/space.jpg': spaceFile
    };

    for(var p in structure) {
      ((path) => {
        this.get(path, function() {
          console.log("GET " + path);
          let data = JSON.stringify(structure[path]);
          return [200, {}, data];
        }); // jshint ignore:line
      })(p);
    }
  });
}
