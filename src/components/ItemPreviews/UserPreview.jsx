import React, {PropTypes} from 'react';
import Radium from 'radium';
import {globalStyles} from '../../utils/styleConstants';
import { Link } from 'react-router';

let styles = {};

const UserPreview = React.createClass({
	propTypes: {
		userData: PropTypes.object,
		displayType: PropTypes.string, // 'line' or 'block'
		headerFontSize: PropTypes.string,
	},

	getDefaultProps: function() {
		return {
			displayType: 'block' 
		};
	},

	render: function() {
		return 'UserPreview';
		// const collection = this.props.userData;
		// return (
		// 	<div style={[styles.container]} >

		// 		<Link style={globalStyles.link} to={'/collection/' + collection.slug}>
		// 			<div key={'headerblock-' + collection._id} style={[styles.headerBlock, {backgroundImage: 'url(' + collection.headerImage + ')'}]}>
		// 				<div style={styles.title}>{collection.title}</div>
		// 				<div style={styles.pubCount}>{collection.pubs.length} Pubs</div>
		// 			</div>
		// 		</Link>

		// 	</div>
		// );
	}
});

export default Radium(UserPreview);

styles = {
	container: {
		width: '100%',
	},
	headerBlock: {
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'center center',
		backgroundSize: 'cover',

		padding: '15px',
		width: 'calc(100% - 30px)',
		color: 'white',	
		
		':hover': {
			// color: 'black',
			boxShadow: '0px 0px 0px 2px rgba(0, 0, 0, 0.85)',
		},
	},
	title: {
		fontSize: '25px',
		textShadow: '0px 0px 1px black',
	},
	pubCount: {
		fontSize: '18px',
		textShadow: '0px 0px 1px black',
	},
};