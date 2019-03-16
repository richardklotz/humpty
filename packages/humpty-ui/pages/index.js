import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Uppy from '@uppy/core';

const styles = theme => ({
	root: {
		textAlign: 'center',
		paddingTop: theme.spacing.unit * 20,
	},
});

class Index extends React.Component {
	state = {
		open: false,
	};

	render() {
		const {classes} = this.props;

		return <div className={classes.root}>TEst</div>;
	}
}

Index.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Index);
