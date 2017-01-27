import React, { PropTypes } from 'react';
import Radium, { Style } from 'radium';
import { Loader, RenderFile } from 'components';
import { globalStyles } from 'utils/globalStyles';
import { globalMessages } from 'utils/globalMessages';
import { FormattedMessage } from 'react-intl';
import dateFormat from 'dateformat';
import ReactMarkdown from 'react-markdown';
import { Popover, PopoverInteractionKind, Position, Menu, MenuItem, MenuDivider, Tooltip } from '@blueprintjs/core';
import { postDiscussion, putDiscussion, postReaction, deleteReaction, toggleCloseDiscussion } from './actionsDiscussions';
import PubLabelList from './PubLabelList';
import { FormattedRelative } from 'react-intl';

let styles;

export const PubDiscussion = React.createClass({
	propTypes: {
		discussion: PropTypes.object,
		pub: PropTypes.object,
		goBack: PropTypes.func,
		allReactions: PropTypes.array,
		accountId: PropTypes.number,
		pathname: PropTypes.string,
		query: PropTypes.object,
		isLoading: PropTypes.bool,
		error: PropTypes.string,
		dispatch: PropTypes.func,
	},

	getInitialState() {
		return {
			description: '',
			openEditor: undefined,
			editTitle: undefined,
			editDescription: undefined,
			mounting: true,
		};
	},

	componentDidMount() {
		this.setState({ mounting: false });
	},

	componentWillMount() {
		this.setState({ editTitle: this.props.discussion.title });
	},
	componentWillReceiveProps(nextProps) {
		if (this.props.isLoading && !nextProps.isLoading && !nextProps.error) {
			this.setState({ description: '', openEditor: undefined });
		}
	},

	inputUpdate: function(key, evt) {
		const value = evt.target.value || '';
		this.setState({ [key]: value });
	},

	validate: function(data) {
		// Check to make sure name exists
		if (!data.files || !data.files.length || !data.files[0].content) {
			return { isValid: false, validationError: <FormattedMessage id="discussion.CannotPostEmptyReply" defaultMessage="Cannot post empty reply" /> };
		}

		return { isValid: true, validationError: undefined };

	},

	createSubmit: function(evt) {
		evt.preventDefault();
		if (!this.props.accountId) {
			return this.setState({ validationError: 'Must be Logged In' });
		}
		const createData = {
			replyRootPubId: this.props.pub.id,
			replyParentPubId: this.props.discussion.id,
			title: 'Reply to: ' + this.props.discussion.title,
			description: undefined,
			files: [
				{
					type: 'text/markdown',
					url: 'temp.md',
					name: 'main.md',
					content: this.state.description,
				}
			],
		};
		const { isValid, validationError } = this.validate(createData);
		this.setState({ validationError: validationError, openEditor: undefined });
		if (!isValid) { return null; }
		return this.props.dispatch(postDiscussion(createData.replyRootPubId, createData.replyParentPubId, createData.title, createData.description, undefined, createData.files, !this.props.discussion.isPublished));		
	},

	setOpenEditor: function(id, description, title) {
		this.setState({ openEditor: id, editDescription: description, editTitle: title });
	},

	discussionChange: function(evt) {
		this.setState({ editDescription: evt.target.value });
	},
	updateDiscussion: function() {
		this.props.dispatch(putDiscussion(this.state.openEditor, undefined, this.state.editDescription));
	},

	editTitleChange: function(evt) {
		this.setState({ editTitle: evt.target.value });
	},
	confirmEditTitle: function() {
		this.props.dispatch(putDiscussion(this.props.discussion.id, this.state.editTitle, undefined));
	},

	createReaction: function(reactionId) {

	},
	destroyReaction: function(reactionId) {

	},

	setReaction: function(pubId, replyRootPubId, reactionId, reactionSet) {
		if (!this.props.accountId) { return false; }

		if (reactionSet) {
			return this.props.dispatch(deleteReaction(pubId, replyRootPubId, reactionId, this.props.accountId));
		}
		return this.props.dispatch(postReaction(pubId, replyRootPubId, reactionId));
	},

	toggleIsClosed: function(newIsClosed) {
		console.log(this.props.discussion);
		this.props.dispatch(toggleCloseDiscussion(this.props.discussion.id, this.props.discussion.replyRootPubId, newIsClosed));
	},

	render: function() {
		const discussion = this.props.discussion || {};
		const pub = this.props.pub || {};

		const pubLabels = pub.pubLabels || [];
		const children = discussion.children || [];
		const allReactions = pub.allReactions || [];
		const isLoading = this.props.isLoading;

		const errorMessage = this.state.validationError || this.props.error;

		const discussions = [discussion, ...children];
		const bottomExpanded = false;

		return (
			<div style={styles.container}>
				<Style rules={{
					'.discussion-item .pt-button-group:not(.pt-vertical) .pt-popover-target, .discussion-item .pt-button-group:not(.pt-vertical) .pt-tether-target': { float: 'none' },
				}} />
				<div style={styles.header}>
					<div style={{ textAlign: 'right' }}>
						<button type="button" className="pt-button small-button pt-icon-chevron-left" onClick={this.props.goBack}>
							Back
						</button>
					</div>
				</div>
				<div style={styles.content} className={'pt-card pt-elevation-3'}>
					<div style={styles.contentScroll}>
						{discussion.isClosed &&
							<div className={'pt-callout pt-intent-danger'} style={{ marginBottom: '1em' }}>Discussion is Closed</div>
						}
						<PubLabelList 
							allLabels={pubLabels} 
							selectedLabels={discussion.labels} 
							pubId={discussion.id} 
							rootPubId={this.props.pub.id} 
							canEdit={pub.canEdit} 
							pathname={this.props.pathname} 
							query={this.props.query} 
							dispatch={this.props.dispatch} />

						{this.state.openEditor !== 'title' &&
							<div style={styles.titleSection}>
								{(true || (discussion.contributors && discussion.contributors[0].user.id === this.props.accountId)) &&
									<div className={'pt-button-group'} style={styles.titleButtons}>
										<button className={'pt-button pt-minimal pt-icon-edit'} onClick={this.setOpenEditor.bind(this, 'title', undefined, discussion.title)} />
										<button className={'pt-button pt-minimal pt-icon-compressed'} onClick={this.toggleIsClosed.bind(this, !discussion.isClosed)} />
									</div>
								}
								<div style={styles.title}>
									{!discussion.isPublished && 
										<span className={'pt-icon-standard pt-icon-lock'}> </span>
									}
									{discussion.title}
								</div>
							</div>
						}

						{this.state.openEditor === 'title' &&
							<div>
								<input type="text" value={this.state.editTitle} onChange={this.editTitleChange} />
								<hr />
								<button className={'pt-button'} onClick={this.setOpenEditor.bind(this, undefined)}>Cancel</button>
								<button className={'pt-button pt-intent-primary'} onClick={this.confirmEditTitle}>Save</button>
								<div style={styles.loaderContainer}>
									<Loader loading={isLoading} showCompletion={!errorMessage} />
								</div>
							</div>
						}

						{discussions.sort((foo, bar)=>{
							// Sort so that oldest is first in array
							if (foo.createdAt > bar.createdAt) { return 1; }
							if (foo.createdAt < bar.createdAt) { return -1; }
							return 0;
						}).map((child, index)=> {
							const user = child.contributors[0].user;
							const isAuthor = user.id === this.props.accountId;
							const editorOpen = this.state.openEditor === child.id;
							const pubReactions = child.pubReactions || [];
							
							const usedReactions = {};
							pubReactions.filter((pubReaction)=> {
								return pubReaction.reactionId;
							}).map((pubReaction)=> {
								const reactionId = pubReaction.reactionId;
								if (reactionId in usedReactions) {
									usedReactions[reactionId].count += 1;
								} else {
									usedReactions[reactionId] = { count: 1, setByUser: false, reaction: pubReaction.reaction };
								}
								if (pubReaction.userId === this.props.accountId) {
									usedReactions[reactionId].setByUser = true;
								}
							});

							const currentVersion = child.versions.reduce((previous, current)=> {
								return (!previous.createdAt || current.createdAt > previous.createdAt) ? current : previous;
							}, {}); // Get the last version

							const files = currentVersion.files || [];

							const mainFile = files.reduce((previous, current)=> {
								if (currentVersion.defaultFile === current.name) { return current; }
								if (!currentVersion.defaultFile && current.name.split('.')[0] === 'main') { return current; }
								return previous;
							}, files[0]);

							return (
								<div key={'discussion-' + index} style={[styles.discussionItem, index === discussions.length - 1 && { marginBottom: `${30 + 70}px` }]}>
									<div style={styles.discussionImageWrapper}>
										<img src={'https://jake.pubpub.org/unsafe/50x50/' + user.avatar} style={styles.discussionImage} />	
									</div>

									<div style={styles.discussionContentWrapper}>
										<div style={styles.discussionButtons} className={'pt-button-group'}>
											<button type="button" style={styles.discussionButton} className="pt-button pt-minimal pt-icon-social-media" />
											<button type="button" style={styles.discussionButton} className="pt-button pt-minimal pt-icon-edit" onClick={this.setOpenEditor.bind(this, child.id, child.description)} />
											<button type="button" style={styles.discussionButton} className="pt-button pt-minimal pt-icon-bookmark" />
										</div>

										<div style={styles.discussionNameWrapper}>
											<span style={styles.discussionName}>{user.firstName + ' ' + user.lastName} </span>
											<span style={styles.discussionDate}><FormattedRelative value={child.createdAt} /></span>
										</div>


										{!editorOpen && 
											<div style={styles.discussionText} className={'discussion-body'}>
												{/*<ReactMarkdown source={child.description} />*/}
												<RenderFile file={mainFile} allFiles={files} noHighlighter={true} />
											</div>
										}
										{editorOpen && 
											<div style={styles.discussionText} className={'discussion-body'}>
												<textarea value={this.state.editDescription} onChange={this.discussionChange} />
												<hr />
												<button className={'pt-button'} onClick={this.setOpenEditor.bind(this, undefined)}>Cancel</button>
												<button className={'pt-button pt-intent-primary'} onClick={this.updateDiscussion}>Save</button>
												<div style={styles.loaderContainer}>
													<Loader loading={isLoading} showCompletion={!errorMessage} />
												</div>
											</div>
										}

										{false && !editorOpen && 
											<div style={{ padding: '0.5em' }}>
												{Object.keys(usedReactions).sort((foo, bar)=> {
													if (usedReactions[foo].count > usedReactions[bar].count) { return -1; }
													if (usedReactions[foo].count < usedReactions[bar].count) { return 1; }
													return 0;
												}).map((reactionId)=> {
													return (
														<div key={'reaction-count-' + child.id + '-' + reactionId} style={styles.reactionCount} className={'pt-tag'}>{usedReactions[reactionId].reaction.title} | {usedReactions[reactionId].count}</div>
													);
												})}
											</div>
										}
									</div>
									
									
								</div>
							);
						})}

					</div>
					<div style={styles.contentBottom}>
						<div style={styles.bottomFade}></div>
						<input style={styles.bottomInput} className={'pt-input'} type={'text'} placeholder={'Reply to discussion'} />
					</div>
				</div>
			</div>

		);
	}
});

export default Radium(PubDiscussion);

styles = {
	container: {
		height: '100%',
		width: '100%',
		position: 'relative',
	},
	header: {
		padding: '10px 0px', 
		height: '50px', 
		width: '100%',
	},
	content: {
		maxHeight: 'calc(100% - 60px)', 
		width: '100%', 
		overflow: 'hidden', 
		position: 'relative',
		padding: 0,
	},
	contentScroll: {
		maxHeight: 'calc(100% - 50px)',
		overflow: 'hidden',
		overflowY: 'scroll',
		padding: '20px 20px 0px'
	},
	contentBottom: {
		width: '100%',
		padding: '20px',
		borderTop: '1px solid #D8E1E8',
		height: '70px',
		position: 'absolute',
		bottom: '0px',
		left: 0,
		backgroundColor: '#fff',
		zIndex: 2,
	},
	bottomFade: {
		position: 'absolute',
		top: '-31px',
		left: 0,
		backgroundImage: ' linear-gradient(rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
		width: '100%',
		height: '30px',
		zIndex: '2',
	},
	bottomInput: {
		width: '100%',
		height: '100%',
	},
	topButton: {
		marginLeft: '0.5em',
		verticalAlign: 'top',
	},
	titleSection: {
		marginBottom: '2em',
	},
	titleButtons: {
		float: 'right',
	},
	title: {
		fontSize: '1.65em',
		fontWeight: '300',
		color: '#3F4B4F',
	},
	discussionItem: {
		paddingTop: '1em',
		marginTop: '1em',
		borderTop: '1px solid #EBF1F5',
		display: 'table',
		width: '100%',
	},
	discussionImageWrapper: {
		display: 'table-cell',
		verticalAlign: 'top',
		width: '1%',
	},
	discussionImage: {
		width: '35px',
		borderRadius: '35px',
	},
	discussionContentWrapper: {
		display: 'table-cell',
		verticalAlign: 'top',
		paddingLeft: '0.5em',
	},
	discussionButtons: {
		float: 'right',
	},
	discussionButton: {
		minWidth: '24px',
		minHeight: '24px',
	},
	discussionNameWrapper: {
		marginBottom: '0.5em',
	},
	discussionName: {
		fontWeight: 'bold',
	},
	discussionDate: {
		color: '#A8B4B9',
	},
	discussionText: {
		fontWeight: '300',
	},
	// container: {
	// 	padding: 0,
	// 	transition: '.1s linear opacity, .1s ease-in-out transform',
	// },
	// topSection: {
	// 	maxHeight: 'calc(100% - 200px)', 
	// 	width: '100%', 
	// 	// backgroundColor: 'orange', 
	// 	overflow: 'hidden', 
	// 	overflowY: 'scroll', 
	// 	position: 'relative',
	// 	padding: '1em',
	// },
	// bottomSection: {
	// 	height: '99px', 
	// 	width: '100%', 
	// 	// backgroundColor: 'red', 
	// 	position: 'relative',
	// 	borderTop: '1px solid #CCC',
	// 	padding: '1em',
	// },
	// bottomFade: {
	// 	position: 'absolute',
	// 	top: '-31px',
	// 	left: 0,
	// 	backgroundImage: ' linear-gradient(rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
	// 	width: '100%',
	// 	height: '30px',
	// 	zIndex: '2',
	// },
	// discussionItem: {
	// 	border: '1px solid #CCC',
	// 	margin: '1em 0em',
	// },
	// discussionItemHeader: {
	// 	display: 'table',
	// 	width: '100%',
	// },
	// discussionItemImageWrapper: {
	// 	display: 'table-cell',
	// 	width: '1%',
	// 	paddingRight: '.5em',
	// },
	// discussionItemImage: {
	// 	width: '50px',
	// 	display: 'block',
	// },
	// discussionItemName: {
	// 	display: 'table-cell',
	// 	verticalAlign: 'middle',
	// },
	// discussionItemActions: {
	// 	display: 'table-cell',
	// 	whiteSpace: 'nowrap',
	// 	width: '1%',
	// 	verticalAlign: 'middle',
	// },
	// discussionItemBody: {
	// 	backgroundColor: 'white',
	// 	padding: '1em 1em',
	// },
	// input: {
	// 	width: 'calc(100% - 20px - 4px)',
	// },
	// loaderContainer: {
	// 	display: 'inline-block',
	// 	position: 'relative',
	// 	top: 15,
	// },
	// description: {
	// 	height: '8em',
	// },
	errorMessage: {
		padding: '10px 0px',
		color: globalStyles.errorRed,
	},
	reactionMenu: {
		maxWidth: '250px',
	},
	reactionItem: {
		margin: '.5em',
	},
	reactionCount: {
		marginRight: '0.5em',
	},
};
