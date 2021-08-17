import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export default class WarningBox extends Plugin {
    static get requires() {
        return [ WarningBoxEditing, WarningBoxUI ];
    }
}

class WarningBoxUI extends Plugin {
    init() {
        console.log( 'WarningBoxUI#init() got called' );

        const editor = this.editor;
        const t = editor.t;

        // The "warningBox" button must be registered among the UI components of the editor
        // to be displayed in the toolbar.
        editor.ui.componentFactory.add( 'warningBox', locale => {
            // The state of the button will be bound to the widget command.
            const command = editor.commands.get( 'insertWarningBox' );

            // The button will be an instance of ButtonView.
            const buttonView = new ButtonView( locale );

            buttonView.set( {
                // The t() function helps localize the editor. All strings enclosed in t() can be
                // translated and change when the language of the editor changes.
                label: t( 'Warning Box' ),
                withText: true,
                tooltip: true
            } );

            // Bind the state of the button to the command.
            buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

            // Execute the command when the button is clicked (executed).
            this.listenTo( buttonView, 'execute', () => editor.execute( 'insertWarningBox' ) );

            return buttonView;
        } );
    }
}

class WarningBoxEditing extends Plugin {
    static get requires() {
        return [ Widget ];
    }

    init() {
        console.log( 'WarningBoxEditing#init() got called' );

        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add( 'insertWarningBox', new InsertWarningBoxCommand( this.editor ) );
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register( 'warningBox', {
            // Behaves like a self-contained object (e.g. an image).
            isObject: true,

            // Allow in places where other blocks are allowed (e.g. directly in the root).
            allowWhere: '$block'
        } );

        schema.register( 'warningBoxTitle', {
            // Cannot be split or left by the caret.
            isLimit: true,

            allowIn: 'warningBox',

            // Allow content which is allowed in blocks (i.e. text with attributes).
            allowContentOf: '$block'
        } );
    }

    _defineConverters() {
        const conversion = this.editor.conversion;

        // <warningBox> converters
        conversion.for( 'upcast' ).elementToElement( {
            model: 'warningBox',
            view: {
                name: 'section',
                classes: 'warning-box'
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'warningBox',
            view: {
                name: 'section',
                classes: 'warning-box'
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'warningBox',
            view: ( modelElement, { writer: viewWriter } ) => {
                const section = viewWriter.createContainerElement( 'section', { class: 'warning-box' } );

                return toWidget( section, viewWriter, { label: 'Info box widget' } );
            }
        } );

        // <warningBoxTitle> converters
        conversion.for( 'upcast' ).elementToElement( {
            model: 'warningBoxTitle',
            view: {
                name: 'h1',
                classes: 'warning-box-content'
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'warningBoxTitle',
            view: {
                name: 'h1',
                classes: 'warning-box-content'
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'warningBoxTitle',
            view: ( modelElement, { writer: viewWriter } ) => {
                // Note: You use a more specialized createEditableElement() method here.
                const h1 = viewWriter.createEditableElement( 'h2', { class: 'warning-box-content' } );

                return toWidgetEditable( h1, viewWriter );
            }
        } );

        // <warningBoxDescription> converters
    }
}

class InsertWarningBoxCommand extends Command {
    execute() {
        this.editor.model.change( writer => {
            // Insert <warningBox>*</warningBox> at the current selection position
            // in a way that will result in creating a valid model structure.
            this.editor.model.insertContent( createWarningBox( writer ) );
        } );
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'warningBox' );

        this.isEnabled = allowedIn !== null;
    }
}

function createWarningBox( writer ) {
    const warningBox = writer.createElement( 'warningBox' );
    const warningBoxTitle = writer.createElement( 'warningBoxTitle' );

    writer.append( warningBoxTitle, warningBox );

    // There must be at least one paragraph for the description to be editable.
    // See https://github.com/ckeditor/ckeditor5/issues/1464.

    return warningBox;
}