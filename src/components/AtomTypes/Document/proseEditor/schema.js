import {Schema, Inline, Block, Text, Attribute, MarkType} from 'prosemirror/dist/model';
import {Doc, BlockQuote, OrderedList, BulletList, ListItem, HorizontalRule, Heading, CodeBlock, Paragraph, Image, HardBreak, EmMark, StrongMark, LinkMark, CodeMark} from 'prosemirror/dist/schema-basic';

import ElementSchema from './elementSchema';

// An Emoji node type.
class Emoji extends Inline {
  get attrs() {
	return {
		content: new Attribute,
		markup: new Attribute,
	};
  }
  toDOM(node) { return ['span', node.attrs.content]; }
}

// A Pagebreak node Type
class PageBreak extends Block {
	toDOM() { return ['div', {class: 'pagebreak'}, 'pagebreak']; }
}

exports.PageBreak = PageBreak;

// A subscript mark
class SubMark extends MarkType {
	get matchDOMTag() { return {'sub': null}; }
	toDOM() { return ['sub']; }
}
exports.SubMark = SubMark;

// A superscript mark
class SupMark extends MarkType {
	get matchDOMTag() { return {'sup': null}; }
	toDOM() { return ['sup']; }
}
exports.StrongMark = StrongMark;


// A strike through mark
class StrikeThroughMark extends MarkType {
	get matchDOMTag() { return {'s': null}; }
	toDOM() { return ['s']; }
}
exports.StrikeThroughMark = StrikeThroughMark;

// ;; An inline embed node type. Has these attributes:
//
// - **`src`** (required): The slug of the pub.
// - **`className`**: An optional className for styling.
// - **`id`**: An option id for styling to linking.
// - **`align`**: inline, left, right, or full
// - **`size`**: CSS valid width
// - **`caption`**: String caption to place under the embed
// - **`data`**: Cached version/atom data. This is not serialized into markdown (in the long-term), but is kept here for fast rendering

class Embed extends Inline {
	get attrs() {
		return {
			source: new Attribute,
			className: new Attribute({default: ''}),
			id: new Attribute({default: ''}),
      nodeId: new Attribute({default: null}),
			align: new Attribute({default: 'full'}),
			size: new Attribute({default: ''}),
			caption: new Attribute({default: ''}),
			mode: new Attribute({default: 'embed'}), // mode = embed || cite
			data: new Attribute({default: {}}),
			selected: new Attribute({default: false}),
      figureName: new Attribute({default: {}}),
		};
	}
	get draggable() { return true; }


  // What if this doesnt exist?
	get matchDOMTag() {
		return {'.embed': dom => {
			const nodeId = dom.getAttribute('data-nodeId');
			const nodeAttrs = ElementSchema.findNodeById(nodeId);
			return {
				source: nodeAttrs.source,
				data: nodeAttrs.data,
				align: nodeAttrs.align,
				size: nodeAttrs.size,
				caption: nodeAttrs.caption,
				mode: nodeAttrs.mode,
				className: nodeAttrs.className,
        figureName: nodeAttrs.figureName,
        nodeId: nodeAttrs.nodeId,
				children: null,
				childNodes: null,
			};
		}};
	}

	toDOM(node) {
		return ElementSchema.createElementAtNode(node);
	}
}

exports.Embed = Embed;


class Pointer extends Inline {
	get attrs() {
		return {
			figureName: new Attribute({default: ''}),
		};
	}
	get draggable() { return true; }

	get matchDOMTag() {
		return {'.pointer': dom => {
			const figureName = dom.getAttribute('data-figureName');

			return {
				figureName: figureName,
			};
		}};
	}

	toDOM(node) {
		return ElementSchema.createPointerAtNode(node);
	}
}

exports.Pointer = Pointer;


class BlockEmbed extends Block {
	get attrs() {
		return {
			source: new Attribute,
			className: new Attribute({default: ''}),
			id: new Attribute({default: ''}),
      nodeId: new Attribute({default: null}),
			align: new Attribute({default: 'full'}),
			size: new Attribute({default: ''}),
			caption: new Attribute({default: ''}),
			mode: new Attribute({default: 'embed'}), // mode = embed || cite
			data: new Attribute({default: {}}),
			selected: new Attribute({default: false}),
      figureName: new Attribute({default: {}}),
		};
	}
	get draggable() { return true; }


  // What if this doesnt exist?
	get matchDOMTag() {
		return {'.block-embed': dom => {
			const nodeId = dom.getAttribute('data-nodeId');
			const nodeAttrs = ElementSchema.findNodeById(nodeId);
			return {
				source: nodeAttrs.source,
				data: nodeAttrs.data,
				align: nodeAttrs.align,
				size: nodeAttrs.size,
				caption: nodeAttrs.caption,
				mode: nodeAttrs.mode,
				className: nodeAttrs.className,
        figureName: nodeAttrs.figureName,
        nodeId: nodeAttrs.nodeId,
				children: null,
				childNodes: null,
			};
		}};
	}

	toDOM(node) {
		return ElementSchema.createElementAtNode(node, true);
	}
}

exports.BlockEmbed = BlockEmbed;



export const schema = new Schema({
	nodes: {
		doc: {type: Doc, content: 'block+'},

		paragraph: {type: Paragraph, content: 'inline<_>*', group: 'block'},
		blockquote: {type: BlockQuote, content: 'block+', group: 'block'},
		ordered_list: {type: OrderedList, content: 'list_item+', group: 'block'},
		bullet_list: {type: BulletList, content: 'list_item+', group: 'block'},
		horizontal_rule: {type: HorizontalRule, group: 'block'},
		page_break: {type: PageBreak, group: 'block'},
		heading: {type: Heading, content: 'inline<_>*', group: 'block'},
		code_block: {type: CodeBlock, content: 'text*', group: 'block'},
		block_embed: {type: BlockEmbed, group: 'block'},

		list_item: {type: ListItem, content: 'paragraph block*'},

		text: {type: Text, group: 'inline'},
		emoji: {type: Emoji, group: 'inline'},
		image: {type: Image, group: 'inline'},
		embed: {type: Embed, group: 'inline'},
		pointer: {type: Pointer, group: 'inline'},
		hard_break: {type: HardBreak, group: 'inline'}
	},
	marks: {
		em: EmMark,
		strong: StrongMark,
		link: LinkMark,
		code: CodeMark,
		sub: SubMark,
		sup: SupMark,
		strike: StrikeThroughMark,
	}
});
