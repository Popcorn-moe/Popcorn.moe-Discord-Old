import { SimpleCompoundCommand } from './index';
import * as gif from './gif';
import * as echo from './test';
import * as help from './help';
import * as voice from './voice';

const commands = [gif, echo, help, voice];

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

        const regCmd = command => this.registerCommand(command, this);
        commands.forEach(file => file.register(app, regCmd));
    }

    registerCommand(command, self = this) //2nd parameter optional
    {
        console.log(`Registering command '${command.name}'.`);
        self.registerChild(command, self);
    }
}
