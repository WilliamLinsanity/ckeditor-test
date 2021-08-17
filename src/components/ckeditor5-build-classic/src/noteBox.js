import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export default class NoteBox extends Plugin {
    static get requires() {
        return [ NoteBoxEditing, NoteBoxUI ];
    }
}

class NoteBoxUI extends Plugin {
    init() {
        console.log( 'NoteBoxUI#init() got called' );

        const editor = this.editor;
        const t = editor.t;

        // The "NoteBox" button must be registered among the UI components of the editor
        // to be displayed in the toolbar.
        editor.ui.componentFactory.add( 'NoteBox', locale => {
            // The state of the button will be bound to the widget command.
            const command = editor.commands.get( 'insertNoteBox' );

            // The button will be an instance of ButtonView.
            const buttonView = new ButtonView( locale );

            buttonView.set( {
                // The t() function helps localize the editor. All strings enclosed in t() can be
                // translated and change when the language of the editor changes.
                label: t( 'Note Box' ),
                withText: true,
                tooltip: true
            } );

            // Bind the state of the button to the command.
            buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

            // Execute the command when the button is clicked (executed).
            this.listenTo( buttonView, 'execute', () => editor.execute( 'insertNoteBox' ) );

            return buttonView;
        } );
    }
}

class NoteBoxEditing extends Plugin {
    static get requires() {
        return [ Widget ];
    }

    init() {
        console.log( 'NoteBoxEditing#init() got called' );

        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add( 'insertNoteBox', new InsertNoteBoxCommand( this.editor ) );
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register( 'NoteBox', {
            // Behaves like a self-contained object (e.g. an image).
            isObject: true,

            // Allow in places where other blocks are allowed (e.g. directly in the root).
            allowWhere: '$block'
        } );

        schema.register( 'NoteBoxTitle', {
            // Cannot be split or left by the caret.
            isLimit: true,

            allowIn: 'NoteBox',

            // Allow content which is allowed in blocks (i.e. text with attributes).
            allowContentOf: '$block'
        } );
    }

    _defineConverters() {
        const conversion = this.editor.conversion;

        // <NoteBox> converters
        conversion.for( 'upcast' ).elementToElement( {
            model: 'NoteBox',
            view: {
                name: 'section',
                classes: 'Info-box'
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'NoteBox',
            view: {
                name: 'section',
                classes: 'Info-box'
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'NoteBox',
            view: ( modelElement, { writer: viewWriter } ) => {
                const section = viewWriter.createContainerElement( 'section', { class: 'Info-box' } );

                return toWidget( section, viewWriter, { label: 'Info box widget' } );
            }
        } );

        // <NoteBoxTitle> converters
        conversion.for( 'upcast' ).elementToElement( {
            model: 'NoteBoxTitle',
            view: {
                name: 'h1',
                classes: 'Info-box-content'
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'NoteBoxTitle',
            view: {
                name: 'h1',
                classes: 'Info-box-content'
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'NoteBoxTitle',
            view: ( modelElement, { writer: viewWriter } ) => {
                // Note: You use a more specialized createEditableElement() method here.
                const h1 = viewWriter.createEditableElement( 'h2', { class: 'Info-box-content' } );

                return toWidgetEditable( h1, viewWriter );
            }
        } );

        // <NoteBoxDescription> converters
    }
}

class InsertNoteBoxCommand extends Command {
    execute() {
        this.editor.model.change( writer => {
            // Insert <NoteBox>*</NoteBox> at the current selection position
            // in a way that will result in creating a valid model structure.
            this.editor.model.insertContent( createNoteBox( writer ) );
        } );
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'NoteBox' );

        this.isEnabled = allowedIn !== null;
    }
}

function createNoteBox( writer ) {
    const NoteBox = writer.createElement( 'NoteBox' );
    const NoteBoxTitle = writer.createElement( 'NoteBoxTitle' );

    writer.append( NoteBoxTitle, NoteBox );

    // There must be at least one paragraph for the description to be editable.
    // See https://github.com/ckeditor/ckeditor5/issues/1464.

    return NoteBox;
}