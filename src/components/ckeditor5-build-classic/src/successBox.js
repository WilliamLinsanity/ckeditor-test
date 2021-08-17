import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export default class SuccessBox extends Plugin {
    static get requires() {
        return [ SuccessBoxEditing, SuccessBoxUI ];
    }
}

class SuccessBoxUI extends Plugin {
    init() {
        console.log( 'SuccessBoxUI#init() got called' );

        const editor = this.editor;
        const t = editor.t;

        // The "successBox" button must be registered among the UI components of the editor
        // to be displayed in the toolbar.
        editor.ui.componentFactory.add( 'successBox', locale => {
            // The state of the button will be bound to the widget command.
            const command = editor.commands.get( 'insertSuccessBox' );

            // The button will be an instance of ButtonView.
            const buttonView = new ButtonView( locale );

            buttonView.set( {
                // The t() function helps localize the editor. All strings enclosed in t() can be
                // translated and change when the language of the editor changes.
                label: t( 'Success Box' ),
                withText: true,
                tooltip: true
            } );

            // Bind the state of the button to the command.
            buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

            // Execute the command when the button is clicked (executed).
            this.listenTo( buttonView, 'execute', () => editor.execute( 'insertSuccessBox' ) );

            return buttonView;
        } );
    }
}

class SuccessBoxEditing extends Plugin {
    static get requires() {
        return [ Widget ];
    }

    init() {
        console.log( 'SuccessBoxEditing#init() got called' );

        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add( 'insertSuccessBox', new InsertSuccessBoxCommand( this.editor ) );
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register( 'successBox', {
            // Behaves like a self-contained object (e.g. an image).
            isObject: true,

            // Allow in places where other blocks are allowed (e.g. directly in the root).
            allowWhere: '$block'
        } );

        schema.register( 'successBoxTitle', {
            // Cannot be split or left by the caret.
            isLimit: true,

            allowIn: 'successBox',

            // Allow content which is allowed in blocks (i.e. text with attributes).
            allowContentOf: '$block'
        } );
    }

    _defineConverters() {
        const conversion = this.editor.conversion;

        // <successBox> converters
        conversion.for( 'upcast' ).elementToElement( {
            model: 'successBox',
            view: {
                name: 'section',
                classes: 'success-box'
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'successBox',
            view: {
                name: 'section',
                classes: 'success-box'
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'successBox',
            view: ( modelElement, { writer: viewWriter } ) => {
                const section = viewWriter.createContainerElement( 'section', { class: 'success-box' } );

                return toWidget( section, viewWriter, { label: 'Info box widget' } );
            }
        } );

        // <successBoxTitle> converters
        conversion.for( 'upcast' ).elementToElement( {
            model: 'successBoxTitle',
            view: {
                name: 'h1',
                classes: 'success-box-content'
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'successBoxTitle',
            view: {
                name: 'h1',
                classes: 'success-box-content'
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'successBoxTitle',
            view: ( modelElement, { writer: viewWriter } ) => {
                // Note: You use a more specialized createEditableElement() method here.
                const h1 = viewWriter.createEditableElement( 'h2', { class: 'success-box-content' } );

                return toWidgetEditable( h1, viewWriter );
            }
        } );

        // <successBoxDescription> converters
    }
}

class InsertSuccessBoxCommand extends Command {
    execute() {
        this.editor.model.change( writer => {
            // Insert <successBox>*</successBox> at the current selection position
            // in a way that will result in creating a valid model structure.
            this.editor.model.insertContent( createSuccessBox( writer ) );
        } );
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'successBox' );

        this.isEnabled = allowedIn !== null;
    }
}

function createSuccessBox( writer ) {
    const successBox = writer.createElement( 'successBox' );
    const successBoxTitle = writer.createElement( 'successBoxTitle' );

    writer.append( successBoxTitle, successBox );

    // There must be at least one paragraph for the description to be editable.
    // See https://github.com/ckeditor/ckeditor5/issues/1464.

    return successBox;
}