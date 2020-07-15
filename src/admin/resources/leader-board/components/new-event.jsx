import React, {PureComponent} from 'react';
import Select from 'react-select';
import {Label, Input, Button, InputGroup} from 'admin-bro';
import {selectStyles} from './constants';


const MS_HOUR = 1000 * 60 * 60;
const MS_DAY = MS_HOUR * 24;
const MS_WEEK = MS_DAY * 7;
const MS_MONTH = MS_DAY * 31;

const DURATIONS = {
  H: {label: 'hours', value: MS_HOUR},
  D: {label: 'days', value: MS_DAY},
  W: {label: 'weeks', value: MS_WEEK},
  M: {label: 'months (31 days)', value: MS_MONTH}
};
const DURATION_OPTIONS = Object.values(DURATIONS);



export default class CreateEvent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      targetMoneyAmount: '0',
      maxLeaderCount: '0',
      eventDuration: '1',
      eventDurationUnit: DURATIONS.D
    }
  }

  onDirectionUnitChange(eventDurationUnit) {
    this.setState({eventDurationUnit});
  }

  onTextChange(prop, {target: {value}}) {
    this.setState({[prop]: value});
  }

  onSubmit(e) {
    const {href} = this.props.resource;
    let {targetMoneyAmount, maxLeaderCount, eventDuration, eventDurationUnit} = this.state;

    e.preventDefault();

    if (isNaN(eventDuration) || eventDuration <= 0) {
      return alert(
        `The \`${eventDuration}\` is not a correct value of the field "Event Duration". It should be number and more than 0.`
      );
    }

    const eventData = {
      leadersLimit: parseInt(maxLeaderCount),
      targetMoneyAmount: parseFloat(targetMoneyAmount),
      eventDuration: eventDuration * eventDurationUnit.value
    };

    fetch('/admin/custom-api/events/create', {
      method: 'POST',
      body: JSON.stringify(eventData),
      headers: {'Content-type': 'application/json;charset=UTF-8'}
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 400 && data.details) {
          data.details.forEach(error => alert(error.message));
          return;
        }

        alert('New event created');
        window.location.href = href;
      })
      .catch(() => {
        alert('Unexpected server error');
      });
  }

  render() {
    const {
      targetMoneyAmount,
      maxLeaderCount,
      eventDuration,
      eventDurationUnit
    } = this.state;

    return (
      <section>
        <div className="form-filed">
          <Label>Target Amount of Money</Label>
          <Input
            value={targetMoneyAmount}
            onChange={event => this.onTextChange('targetMoneyAmount', event)}
          />
        </div>

        <div className="form-filed">
          <Label>Maximum Amount of Leaders</Label>
          <Input
            value={maxLeaderCount}
            onChange={event => this.onTextChange('maxLeaderCount', event)}
          />
        </div>

        <div className="form-filed">
          <Label>Event Duration</Label>

          <InputGroup>
            <Input
              value={eventDuration}
              onChange={event => this.onTextChange('eventDuration', event)}
            />

            <Select
              value={eventDurationUnit}
              options={DURATION_OPTIONS}
              styles={selectStyles}
              onChange={value => this.onDirectionUnitChange(value)}
            />
          </InputGroup>
        </div>

        <div className="form-button">
          <Button variant="primary" onClick={event => this.onSubmit(event)}>
            Create event
          </Button>
        </div>
      </section>
    );
  }
}
