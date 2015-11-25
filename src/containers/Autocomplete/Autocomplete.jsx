import React, { PropTypes } from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import {LoaderIndeterminate} from '../../components';
import {complete, completeFromCache, clear} from '../../actions/autocomplete';

let styles = {};

const Autocomplete = React.createClass({
	propTypes: {
		autocompleteData: PropTypes.object,
		dispatch: PropTypes.func,

		autocompleteKey: PropTypes.string,
		resultRenderFunction: PropTypes.func,
		route: PropTypes.string,
		height: PropTypes.number,
		placeholder: PropTypes.string,
		textAlign: PropTypes.string,
		showBottomLine: PropTypes.bool,
		hideResultsOnClickOut: PropTypes.bool,
	},

	getDefaultProps: function() {
		return {
			route: '/autocompletePubs',
			height: 30,
			placeholder: 'Placeholder',
			textAlign: 'left',
			showBottomLine: true,
			hideResultsOnClickOut: true,
		};
	},

	getInitialState: function() {
		return {
			inputString: '',
			showMenu: true,

		};
	},

	componentDidMount: function() {
		// If we want to hideResultsOnClickOut,
		// Attach a listener so we can tell when we're clicking inside the autocomplete menu and outside
		if (this.props.hideResultsOnClickOut === true) {
			document.documentElement.addEventListener('click', this.handleClicks);
		}
		
	},

	componentWillUnmount: function() {
		// On unmount, clear autocomplete results, remove listener in case we attached one.
		this.props.dispatch(clear(this.props.autocompleteKey));
		document.documentElement.removeEventListener('click', this.handleClicks);
	},

	handleClicks: function(event) {
		if (document.getElementById('autocompleteMenu').contains(event.target)) {
			this.setState({showMenu: true});
		} else {
			this.setState({showMenu: false});
		}
	},

	handleOnChange: function(event) {
		this.setState({inputString: event.target.value});
		// const currentCompleteData = this.props.autocompleteData.get(this.props.autocompleteKey);
		// console.log('currentCompleteData', currentCompleteData);
		// console.log('currentCompleteData.get(cache)', currentCompleteData.get('cache'));
		// console.log('has', currentCompleteData.get('cache').has(event.target.value));
		// if (currentCompleteData) {
		// 	console.log('hascache', currentCompleteData.has('cache'));
		// 	console.log('getcache', currentCompleteData.get('cache'));	
		// }

		// if (currentCompleteData && currentCompleteData.get('cache')) {
		// 	console.log('made it to the hasin test');
		// 	console.log('hasin', currentCompleteData.hasIn(['cache', event.target.value]));
		// }
		
		// if (currentCompleteData && currentCompleteData.get('cache') && currentCompleteData.hasIn(['cache', event.target.value])) {
		console.log('about to test');
		if (this.props.autocompleteData) {
			console.log(this.props.autocompleteData.toJS());
			console.log(this.props.autocompleteData.hasIn([this.props.autocompleteKey, 'cache']));
			console.log( event.target.value);	
			console.log(this.props.autocompleteData.hasIn([this.props.autocompleteKey, 'cache', event.target.value]));	
		}
		
		if (this.props.autocompleteData.hasIn([this.props.autocompleteKey, 'cache', event.target.value])) {
			// console.log(currentCompleteData.cache);
			console.log('calling the cache dispatch');
			this.props.dispatch(completeFromCache(this.props.autocompleteKey, event.target.value, this.props.autocompleteData.getIn([this.props.autocompleteKey, 'cache', event.target.value])));
		} else {
			console.log('calling the server dispatch');
			this.props.dispatch(complete(this.props.autocompleteKey, this.props.route, event.target.value));	
		}
		
		
	},

	inputStyle: function() {
		return {
			textAlign: this.props.textAlign,
			height: (this.props.height - 3),
			fontSize: (this.props.height - 3 - 10),
			borderColor: this.props.showBottomLine ? '#aaa' : 'transparent',
		};
	},

	loaderStyle: function() {
		return {
			top: this.props.height - 1
		};
	},

	render: function() {
		let resultData = {};
		if (this.props.autocompleteData.get(this.props.autocompleteKey) !== undefined) {
			resultData = this.props.autocompleteData.get(this.props.autocompleteKey).toJS();
		}

		return (
			<div style={styles.container} id="autocompleteMenu">
				<input type="text" 
					placeholder={this.props.placeholder} 
					style={[styles.input, this.inputStyle()]} 
					onChange={this.handleOnChange} 
					value={this.state.inputString}/>

				<div style={[styles.loader, this.loaderStyle()]}>
					{resultData.loading
						? <LoaderIndeterminate color={'#000'}/>
						: null
					}
				</div>

				<div className="resultsWrapper">
					{resultData.data && this.state.showMenu
						? this.props.resultRenderFunction(resultData.data)
						: null
					}
				</div>

			</div>
		);
	}

});

export default connect( state => {
	return {autocompleteData: state.autocomplete};
})( Radium(Autocomplete) );

styles = {
	container: {
		width: '100%',
		overflow: 'hidden',
		position: 'relative',
	},
	input: {
		fontFamily: 'Lato',
		width: 'calc(100% - 2px)',
		borderWidth: '0px 0px 1px 0px',
		outline: 'none',
	},
	loader: {
		position: 'absolute',
		width: '100%',
	},

};
