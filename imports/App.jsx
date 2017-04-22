import React, {Component, PropTypes} from "react";
import {createContainer} from "meteor/react-meteor-data";
import ReactDOM from "react-dom";
import {Messages} from "../collection/Messages";
import AccountsUIWrapper from "./AccountsUIWrapper.jsx";


class App extends Component {
    constructor(props) {
        super(props);
        this.setUser = this.setUser.bind(this);
        this.state = {
            userId: '',
            userEmail: ''
        };
    }

    renderMessages(msgs) {
        return msgs.map(function (message) {
            if(message.from==Meteor.userId()){
                return (
                    <div key={message._id} className="alert alert-info text-right" style={{marginLeft: '30px'}}>
                        <strong>ID: </strong> {message.text}
                    </div>
                )
            }
            else {
                return (
                    <div key={message._id} className="alert alert-success text-left" style={{marginRight: '30px'}}>
                        <strong>  {message.text} </strong>
                    </div>
                )
            }

        });
    }

    setUser(userId, userEmail) {
        this.setState({
            userId: userId,
            userEmail: userEmail
        })
    }

    renderUsers() {
        var that = this;
        return this.props.buddies.map(function (buddy) {
            return (
                <div key={buddy._id} className="alert alert-success">
                    <a onClick={() => that.setState({userId: buddy._id, userEmail: buddy.emails[0].address})}>
                        <strong>{buddy.emails[0].address} </strong>
                    </a>
                </div>
            )
        });
    }

    handleSend(e) {
        if (e.key === 'Enter') {
            const message = ReactDOM.findDOMNode(this.refs.message).value.trim();
            console.log(message);
            if (this.state.userId && message) {
                Messages.insert({
                    to: this.state.userId,
                    from: Meteor.userId(),
                    text: message,
                    createdAt: new Date(), // current time
                });
            }
            ReactDOM.findDOMNode(this.refs.message).value = '';
        }
    }

    render() {
        let MessagesByMe = Messages.find(
            {
                to: {$in: [this.state.userId, Meteor.userId()]},
                from: {$in: [this.state.userId, Meteor.userId()]}
            },
            {sort: {createdAt: 1}}).fetch();

        if (Meteor.user() && this.props.messages && this.props.buddies) {
            return (
                <div>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <br/>
                                <br/>
                                <AccountsUIWrapper/>
                                <br/>
                                <br/>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <div className="row">

                            <div className="col-md-3">
                                <label ><strong>Buddies</strong></label>
                                {this.renderUsers()}

                            </div>
                            <div className="col-md-6">
                                <label >Messages to : {this.state.userEmail}</label>
                                {this.renderMessages(MessagesByMe)}
                                <div className="form-group">
                                    <input onKeyPress={this.handleSend.bind(this)} type="text" ref="message" className="form-control"
                                           style={{minHeight: '50px'}}/>
                                    <br/>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <br/>
                            <br/>
                            <AccountsUIWrapper/>
                            <br/>
                            <br/>
                        </div>
                    </div>
                </div>
            )
        }
    }
}

App.propTypes = {
    messages: PropTypes.array.isRequired,
    buddies: PropTypes.array.isRequired
};

export default createContainer(() => {
    Meteor.subscribe('allEmails');
    return {
        messages: Messages.find({}, {sort: {createdAt: 1}}).fetch(),
        buddies: Meteor.users.find({_id: {$ne: Meteor.userId()}}, {fields: {emails: 1}}).fetch()
    };
}, App);
