const app = Vue.createApp({
  data() {
    return {
      fileList: [],
      fileName: "",
      content: "",
    }
  },
  created() {
    this.checkRecovered();
    this.listAllFiles();
  },
  computed: {
    showName() {
      return this.fileName
    }
  },
  methods: {
    listAllFiles() {
      fetchData(_url("/listfile")).then(result => {
        this.fileList = result
      })
    },
    checkRecovered() {
      fetchData(_url("/keyrecovered")).then(result => {
        if (!result) {
          this.requirePass();
        }
      })
    },
    showFileT(name) {
      this.fileName = name
      fetchData(_url("/decryptT"), {
        name: name
      }).then(result => {
        console.log(result)
        this.content = result
      })
    },
    createFile() {
      var name = prompt("new file name", "new_file");
      if (name == "" || name == null) {
        alert("name is empty!")
        return this.createFile()
      }
      fetchData(_url("/listfile")).then(result => {
        if (result.includes(name)) {
          alert("name exists!")
        } else {
          this.fileName = name
          this.content = ""
          fetch(_url("/savefile"), {
            method: "post",
            body: $('#file_form').serialize(),
          }).then(result => {
            alert("saved!")
            this.listAllFiles();
          })
        }
      })
    },
    push() {
      fetchData(_url("/push"))
    },
    pull() {
      fetchData(_url("/pull"))
    },
    saveFile() {
      fetch(_url("/savefile"), {
        method: "post",
        body: $('#file_form').serialize(),
      }).then(result => {
        alert("saved!")
        this.listAllFiles();
      })
    },
    removeFile() {
      let file = $("#deleteName").val();
      fetchData(_url("/listfile")).then(result => {
        if (!result.includes(file)) {
          alert("file not exists!")
        } else {
          fetchData(_url("/delete"), {
            name: file
          }).then(result => {
            alert("deleted");
            listAllFiles();
          })
        }
      })
    },
    requirePass() {

      fetchData(_url("/keyexist")).then(result => {
        var text;
        if (result) {
          text = "key file found, please type password to recover it:";
          var pass = prompt(text, "password");
          if (pass == null || pass == "") {
            requirePass();
          } else {
            fetchData(_url("/recoverkey"), {
              pass: pass
            }).then(result => {
              if (result) {
                alert("key recovered!")
              } else {
                alert("wrong password!")
                requirePass();
              }
            })
          }
        } else {
          text =
            "key file miss, please copy keyfile or generate new key, \n if you generate new key, all encrypted files will be deleted";
          var pass = prompt(text, "password");
          if (pass == null || pass == "") {
            requirePass();
          } else {
            fetchData(_url("/genkey"), {
              pass: pass
            }).then(result => {
              alert("key generated!")
            })
          }
        }
      })
    }


  }
})

const mountedApp = app.mount('#app')

function _url(path) {
  return "http://localhost:4321" + path
}

function fetchData(url, params, callback) {
  if (params == null) {
    params = {}
  }
  var url = new URL(url)
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
  if (callback == null) {
    return fetch(url).then(response => response.blob()).then(
      b => {
        if (b.type == "text/html") {
          return b.text()
        } else {
          return b.text().then(d => JSON.parse(d))
        }
      }
    )
  } else {
    fetch(url).then(response => response.blob()).then(
      b => {
        if (b.type == "text/html") {
          b.text().then(d => callback(d))
        } else {
          b.text().then(d => callback(JSON.parse(d)))
        }
      }
    )
  }
}
