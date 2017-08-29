import { SimpleCompoundCommand } from './index';
import * as gif from './gif';
import * as echo from './test';
import * as help from './help';

export class RootCommand extends SimpleCompoundCommand
{
    constructor(app)
    {
        super(
            app,
            '',
            'I\'m Lovin\' Unicorns', //Will never be shown
            [],
            '',
            []
        );

        const self = this;

        const regCmd = command => self.registerCommand(command, self);

        echo.register(app, regCmd);
        gif.register(app, regCmd);
        help.register(app, regCmd);
    }

    registerCommand(command, self = this) //2nd parameter optional
    {
        console.log(`Registering command '${command.name}'.`);
        self.registerChild(command, self);
    }
}
