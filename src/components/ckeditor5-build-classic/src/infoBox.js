import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export default class InfoBox extends Plugin {
    static get requires() {
        return [ InfoBoxEditing, InfoBoxUI ];
    }
}

class InfoBoxUI extends Plugin {
    init() {
        console.log( 'InfoBoxUI#init() got called' );

        const editor = this.editor;
        const t = editor.t;

        // The "InfoBox" button must be registered among the UI components of the editor
        // to be displayed in the toolbar.
        editor.ui.componentFactory.add( 'InfoBox', locale => {
            // The state of the button will be bound to the widget command.
            const command = editor.commands.get( 'insertInfoBox' );

            // The button will be an instance of ButtonView.
            const buttonView = new ButtonView( locale );

            buttonView.set( {
                // The t() function helps localize the editor. All strings enclosed in t() can be
                // translated and change when the language of the editor changes.
                label: t( 'Info Box' ),
                withText: true,
                tooltip: true
            } );

            // Bind the state of the button to the command.
            buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

            // Execute the command when the button is clicked (executed).
            this.listenTo( buttonView, 'execute', () => editor.execute( 'insertInfoBox' ) );

            return buttonView;
        } );
    }
}

class InfoBoxEditing extends Plugin {
    static get requires() {
        return [ Widget ];
    }

    init() {
        console.log( 'InfoBoxEditing#init() got called' );

        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add( 'insertInfoBox', new InsertInfoBoxCommand( this.editor ) );
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register( 'InfoBox', {
            // Behaves like a self-contained object (e.g. an image).
            isObject: true,

            // Allow in places where other blocks are allowed (e.g. directly in the root).
            allowWhere: '$block'
        } );

        schema.register( 'InfoBoxTitle', {
            // Cannot be split or left by the caret.
            isLimit: true,

            allowIn: 'InfoBox',

            // Allow content which is allowed in blocks (i.e. text with attributes).
            allowContentOf: '$block'
        } );
    }

    _defineConverters() {
        const conversion = this.editor.conversion;

        // <InfoBox> converters
        conversion.for( 'upcast' ).elementToElement( {
            model: 'InfoBox',
            view: {
                name: 'section',
                classes: 'Info-box'
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'InfoBox',
            view: {
                name: 'section',
                classes: 'Info-box'
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'InfoBox',
            view: ( modelElement, { writer: viewWriter } ) => {
                const section = viewWriter.createContainerElement( 'section', { class: 'Info-box' } );

                return toWidget( section, viewWriter, { label: 'Info box widget' } );
            }
        } );

        // <InfoBoxTitle> converters
        conversion.for( 'upcast' ).elementToElement( {
            model: 'InfoBoxTitle',
            view: {
                name: 'h1',
                classes: 'Info-box-content'
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'InfoBoxTitle',
            view: {
                name: 'h1',
                classes: 'Info-box-content'
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'InfoBoxTitle',
            view: ( modelElement, { writer: viewWriter } ) => {
                // Note: You use a more specialized createEditableElement() method here.
                const h1 = viewWriter.createEditableElement( 'h2', { class: 'Info-box-content' } );

                return toWidgetEditable( h1, viewWriter );
            }
        } );

        // <InfoBoxDescription> converters
    }
}

class InsertInfoBoxCommand extends Command {
    execute() {
        this.editor.model.change( writer => {
            // Insert <InfoBox>*</InfoBox> at the current selection position
            // in a way that will result in creating a valid model structure.
            this.editor.model.insertContent( createInfoBox( writer ) );
        } );
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'InfoBox' );

        this.isEnabled = allowedIn !== null;
    }
}

function createInfoBox( writer ) {
    const InfoBox = writer.createElement( 'InfoBox' );
    const InfoBoxTitle = writer.createElement( 'InfoBoxTitle' );

    writer.append( InfoBoxTitle, InfoBox );

    // There must be at least one paragraph for the description to be editable.
    // See https://github.com/ckeditor/ckeditor5/issues/1464.

    return InfoBox;
}