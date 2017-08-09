import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
	accentColor: PropTypes.string.isRequired, // Primary accent color
	accentTextColor: PropTypes.string.isRequired, // Text color that looks good on primary
	accentActionColor: PropTypes.string.isRequired, // Background color for buttons
	accentHoverColor: PropTypes.string.isRequired,
	accentMinimalColor: PropTypes.string.isRequired, // Opacity 15% color for tags, etc
};

const AccentStyle = function(props) {
	return (
		<style>{`
			.accent-background { background-color: ${props.accentColor}; } 
			.accent-color { color: ${props.accentTextColor}; }
			.pt-button.pt-intent-primary { background-color: ${props.accentActionColor}; color: ${props.accentTextColor}; }
			.pt-button.pt-intent-primary:hover { background-color: ${props.accentHoverColor}; color: ${props.accentTextColor}; }
			.pt-button.pt-intent-primary:active, .pt-button.pt-intent-primary.pt-active { background-color: ${props.accentColor}; color: ${props.accentTextColor}; }
			.pt-tag.pt-intent-primary { background: ${props.accentColor}; color: ${props.accentTextColor}; }
			.pt-tag.pt-minimal.pt-intent-primary { background-color: ${props.accentMinimalColor}; }
			.accent-color .pt-button:not([class*="pt-intent-"]), .accent-color .pt-button[class*="pt-icon-"]::before { color: inherit; }
			.accent-color a, .accent-color a:hover { color: inherit; }
		`}</style>
	);
};

AccentStyle.propTypes = propTypes;
export default AccentStyle;