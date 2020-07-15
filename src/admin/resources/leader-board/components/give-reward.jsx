import React, {PureComponent} from 'react';
import Select from 'react-select';
import {Label, Input, Button} from 'admin-bro';
import {selectStyles} from './constants';
import {REWARDS} from '../../../../models/constants';


const REWARD_OPTIONS = [
  {label: 'Money', value: REWARDS.MONEY},
  {label: 'Coupons', value: REWARDS.COUPONS},
  {label: 'Coupons Parts', value: REWARDS.COUPONS_PARTS},
  {label: 'Hard Currency', value: REWARDS.HARD_CURRENCY},
  {label: 'Soft Currency', value: REWARDS.SOFT_CURRENCY},
];


export default class GiveReward extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      amount: '0',
      reward: REWARD_OPTIONS[0]
    }
  }

  onAmountChange({target: {value}}) {
    this.setState({amount: value});
  }

  onRewardChange(reward) {
    this.setState({reward});
  }

  onSubmit(e) {
    const {userId} = this.props.record.params;
    const {href} = this.props.resource;
    const {amount, reward} = this.state;

    e.preventDefault();

    const data = {
      userId,
      reward: reward.value,
      amount: parseFloat(amount)
    };

    fetch('/admin/custom-api/events/give-reward', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {'Content-type': 'application/json;charset=UTF-8'}
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 400 && data.details) {
          data.details.forEach(error => alert(error.message));
          return;
        }

        alert('The prize was sent successfully');
        window.location.href = href;
      })
      .catch(() => {
        alert('Unexpected server error');
      });
  }

  render() {
    const {amount, reward} = this.state;

    return (
      <section>
        <div className="form-filed">
          <Label>Event Duration</Label>
          <Select
            value={reward}
            options={REWARD_OPTIONS}
            styles={selectStyles}
            onChange={value => this.onRewardChange(value)}
          />
        </div>

        <div className="form-filed">
          <Label>Maximum Amount of Leaders</Label>
          <Input
            value={amount}
            onChange={event => this.onAmountChange(event)}
          />
        </div>

        <div className="form-button">
          <Button variant="primary" onClick={event => this.onSubmit(event)}>
            Send a Prize
          </Button>
        </div>
      </section>
    );
  }
}