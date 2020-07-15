import React, {PureComponent} from 'react';
import {Label, Button} from 'admin-bro';
import {readImageFromFile, readBase64FromArrayBuffer} from './utils';


const IMAGE_MAX_SIZE = 512;
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif'
];

export default class SetPhoto extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dataUrl: null,
      file: null
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    const {id} = this.props.record;

    fetch(`/admin/custom-api/spot/${id}/photo`)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => {
        if (arrayBuffer.byteLength === 0) {
          return;
        }

        const base64 = readBase64FromArrayBuffer(arrayBuffer);
        this.setState({
          dataUrl: `data:image/png;base64,${base64}`
        });
      });
  }

  validateFileMimeType(file) {
    const isValid = ALLOWED_TYPES.includes(file.type);

    if (!isValid) {
      alert('Allowed file types: JPEG, PNG, GIF');
    }

    return isValid;
  }

  validateImageSize(img) {
    const {width, height} = img;

    if (width !== height) {
      alert('Image proportions must be 1:1 (width = height)');
      return false;
    }

    // checks only the width, because width === height
    if (width > IMAGE_MAX_SIZE) {
      alert(`Maximum allowed size: ${IMAGE_MAX_SIZE}x${IMAGE_MAX_SIZE} pixels`);
      return false;
    }

    return true;
  }

  async onImageChange(event) {
    const {target} = event;
    const [file] = target.files;

    if (!this.validateFileMimeType(file)) {
      return;
    }

    const img = await readImageFromFile(file);

    if (!this.validateImageSize(img)) {
      return;
    }

    this.setState({
      dataUrl: img.src,
      file
    });
  }

  onSubmit(event) {
    const {id} = this.props.record;
    const {href} = this.props.resource;
    const {file} = this.state;
    const formData = new FormData();

    if (file) {
      formData.append('image', file);
    }

    event.preventDefault();

    fetch(`/admin/custom-api/spot/${id}/photo`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 400 && data.details) {
          data.details.forEach(error => alert(error.message));
          return;
        }

        alert('Image saved');
        window.location.href = href;
      })
      .catch(() => {
        alert('Unexpected server error');
      });
  }

  onClear(event) {
    event.preventDefault();

    this.setState({
      dataUrl: null,
      file: null
    });
  }

  render() {
    const FILE_PATH = '';
    const {file, dataUrl} = this.state;

    return (
      <section className="spot-set-photo">
        <label className="img-preview">
          <span className="img-hover-message">
            Click to choose <br />
            an image
          </span>

          {!dataUrl ? (
            <span className="img-placeholder">
              No image
            </span>
          ) : null}

          {dataUrl
            ? <img src={dataUrl} alt="image preview" />
            : null}

          <input
            type="file"
            value={FILE_PATH}
            className="img-input"
            onChange={event => this.onImageChange(event)}
          />
        </label>

        <div className="img-action">
          <Label>Spot image</Label>

          <div className="form-button">
            <Button
              variant="primary"
              disabled={dataUrl && !file}
              onClick={event => this.onSubmit(event)}>
              Save changes
            </Button>
          </div>

          <div className="form-button">
            <Button onClick={event => this.onClear(event)}>
              Remove image
            </Button>
          </div>
        </div>
      </section>
    );
  }
}
