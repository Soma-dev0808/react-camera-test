import React, { useMemo, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { isMobile } from "react-device-detect"
import EXIF from "exif-js"
import axios from 'axios';

function DragImageTest() {
  return (
    <div>
      <StyledDropzone />
    </div>
  );
}

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  width: 200,
  height: 200,
  padding: 4,
  boxSizing: "border-box",
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
};

const img = {
  display: "block",
  width: "auto",
  height: "100%",
};

function StyledDropzone(props) {
  const [files, setFiles] = useState([]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
  } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFiles(
        files.concat(
          acceptedFiles.map((file) => 
          {
            if(isMobile) {
              EXIF.getData(file, function() {
                const orientation = file.exifdata.Orientation
                let canvas = document.createElement("canvas")
                let ctx = canvas.getContext("2d")
  
                var thisImage = new Image;
  
                thisImage.onload = function() {
                  canvas.width  = thisImage.width;
                  canvas.height = thisImage.height;
                  ctx.save();
                  var width  = canvas.width;  
                  var styleWidth = canvas.style.width;
                  var height = canvas.height; 
                  var styleHeight = canvas.style.height;
  
                  if (orientation) {
                    if (orientation > 4) {
                      canvas.width = height; 
                      canvas.style.width = styleHeight;
                      canvas.height = width;  
                      canvas.style.height = styleWidth;
                    }
                    switch (orientation) {
                    case 2: ctx.translate(width, 0);     ctx.scale(-1,1); break;
                    case 3: ctx.translate(width,height); ctx.rotate(Math.PI); break;
                    case 4: ctx.translate(0,height);     ctx.scale(1,-1); break;
                    case 5: ctx.rotate(0.5 * Math.PI);   ctx.scale(1,-1); break;
                    case 6: ctx.rotate(0.5 * Math.PI);   ctx.translate(0,-height); break;
                    case 7: ctx.rotate(0.5 * Math.PI);   ctx.translate(width,-height); ctx.scale(-1,1); break;
                    case 8: ctx.rotate(-0.5 * Math.PI);  ctx.translate(-width,0); break;
                    }
                  }
                  ctx.drawImage(thisImage,0,0);
                  ctx.restore();
                  var dataURL = canvas.toDataURL();
  
                  let tempImage = file
                  tempImage.preview = dataURL
                  uploadToS3(tempImage)
                }
  
                thisImage.src = URL.createObjectURL(file)
              })
            }

            return Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          }
          )
        )
      );
    },
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  const thumbs = files.map((file) => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img src={file.preview} style={img} />
      </div>
    </div>
  ));      

  useEffect(()  => {
    console.log(files)
      if(files.length > 0) {
        uploadToS3(files[0])
      }
    },
    [files]
  );

  useEffect(
    () => () => {
      console.log(files);
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  const filepath = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <div className="container">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
        <button type="button">Open File Dialog</button>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>{filepath}</ul>
      </aside>
      <aside style={thumbsContainer}>{thumbs}</aside>
    </div>
  );
}

export default DragImageTest;


export function uploadToS3(file) {

  console.log(file)
  alert(JSON.stringify(file))

    const contentType = file.type; // eg. image/jpeg or image/svg+xml
  
    const generatePutUrl = 'http://localhost:3500/generate-put-url';
    const options = {
      params: {
        Key: file.name,
        ContentType: contentType
      },
      headers: {
        'Content-Type': contentType
      }
    };
  
    axios.get(generatePutUrl, options).then(res => {
      const {
        data: { putURL }
      } = res;
      axios
        .put(putURL, file, options)
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        });
    })
    .catch(err => alert(JSON.stringify(err, null, 10)))
}

