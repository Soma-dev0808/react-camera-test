import React, { Component } from "react";

export default class SingleImageUploadComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
    };
    this.uploadSingleFile = this.uploadSingleFile.bind(this);
    this.upload = this.upload.bind(this);
  }

  uploadSingleFile(e) {
    this.setState({
      file: URL.createObjectURL(e.target.files[0]),
    });
  }

  upload(e) {
    e.preventDefault();
    console.log(this.state.file);
  }

  render() {
    let imgPreview;
    if (this.state.file) {
      imgPreview = <img src={this.state.file} alt="" />;
    }
    return (
      <form>
        <div className="form-group preview">{imgPreview}</div>

        <div className="form-group">
          <input
            type="file"
            className="form-control"
            onChange={this.uploadSingleFile}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={this.upload}
        >
          Upload
        </button>
      </form>
    );
  }
}



// console.log(file)
// // loadImage(
// //   file.preview,
// //   { meta: true }
// // ).then(res => {
// //   console.log(res)
// // })
// // .catch(err => {
// //   console.log(err)
// // })

// var options = {canvas: true};

// loadImage.parseMetaData(file, function (data) {
//   if (data.exif) {
//     console.log("exifに格納されている情報:\n", data.exif.getAll());

//     // options の orientation は小文字。 exif.getの 'Orientation' は先頭大文字
//     // ここでcanvasの回転を指定している
//     options.orientation = data.exif.get('Orientation');
//     console.log('Orientation: ' + options.orientation);
//   }
//   // 画像の読み込み。完了時に callback が呼び出される
//   // loadImage(file, callback, options);
// });
