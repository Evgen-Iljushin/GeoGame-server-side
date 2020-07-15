import {Button} from 'admin-bro';
import React, {PureComponent} from 'react';


export default class AboutEvent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      leadersLimit: null,
      targetMoneyAmount: null,
      startTime: null,
      endTime: null
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    fetch('/admin/custom-api/events/get-info', {
      headers: {'Content-type': 'application/json;charset=UTF-8'}
    })
    .then(response => response.json())
    .then(data => {
      const {leadersLimit, targetMoneyAmount, startTime, endTime} = data;

      this.setState({
        leadersLimit,
        targetMoneyAmount,
        startTime: new Date(startTime).toGMTString(),
        endTime: new Date(endTime).toGMTString(),
      })
    })
    .catch(err => {
      console.error(err);
      alert('Unexpected server error');
    });
  }

  onStop() {
    const {href} = this.props.resource;

    fetch('/admin/custom-api/events/stop', {
      method: 'POST',
      headers: {'Content-type': 'application/json;charset=UTF-8'}
    })
      .then(response => {
        if (response.ok) {
          alert('Event stopped');
          return window.location.href = href;
        }

        return Promise.reject(response);
      })
      .catch(err => {
        console.error(err);
        alert('Unexpected server error');
      });
  }

  render() {
    const {
      leadersLimit,
      targetMoneyAmount,
      startTime,
      endTime
    } = this.state;

    return (
      <section>
        <table>
          <tbody>
            <tr>
              <th>Target Amount of Money:</th>
              <td>{targetMoneyAmount}</td>
            </tr>

            <tr>
              <th>Maximum Amount of Leaders:</th>
              <td>{leadersLimit}</td>
            </tr>

            <tr>
              <th>Event started at:</th>
              <td>{startTime}</td>
            </tr>

            <tr>
              <th>Event will end in:</th>
              <td>{endTime}</td>
            </tr>
          </tbody>
        </table>

        <div className="form-button">
          <Button variant="primary" onClick={event => this.onStop(event)}>
            Stop event
          </Button>
        </div>
      </section>
    );
  }
}
