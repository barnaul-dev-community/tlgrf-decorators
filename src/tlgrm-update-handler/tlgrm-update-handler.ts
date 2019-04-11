import {
  ITlgrmBotService,
  ITlgrmUpdateHandler,
  ContextMessageUpdate,
} from './interfaces';

function TlgrmUpdateHandler(bot: ITlgrmBotService) {
  return <T extends new(...args: any[]) => {}>(constructor: T) => {
    return class TlgrmUpdateHandler extends constructor implements ITlgrmUpdateHandler {
      [methodName: string]: (ctx: ContextMessageUpdate) => void;

      constructor(...args: any[]) {
        super(...args);

        Object.getOwnPropertyNames(constructor.prototype).map((methodName: string) => {
          const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, methodName);
          if ('command' in descriptor.value && 'handler' in descriptor.value) {
            const { handler, command } = descriptor.value;
            bot.command(command, handler.bind(this));
          }
        });
      }
    };
  };
}

export function command<T extends (ctx: ContextMessageUpdate) => void>(commandName: string | string[]) {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> => {
    if (!descriptor || (typeof descriptor.value !== 'function')) {
      throw new TypeError(`Only methods can be decorated with @command. <${key}> is not a method!`);
    }

    return Object.defineProperty(target, key, {
      value: {
        handler: descriptor.value,
        command: commandName,
      }
    });
  };
}

export const help = command('help');
export const start = command('start');
export const settings = command('settings');

export { TlgrmUpdateHandler };