/**
 * Example Plugin
 * Demonstrates how to create Spark plugins
 */

module.exports = function setup() {
  return [
    // Command Plugin
    {
      type: 'command',
      name: 'greet',
      description: 'Send a greeting',
      usage: 'greet [name]',
      examples: ['greet World', 'greet Alice'],
      execute: async (args, context) => {
        const name = args[0] || 'World';
        const greeting = context.spark.config.greeting || 'Hello';
        return {
          success: true,
          output: `${greeting}, ${name}!`,
        };
      },
    },

    // Hook Plugin
    {
      type: 'hook',
      events: ['task:completed'],
      priority: 50,
      handler: async (event, data, context) => {
        context.logger.info(`Task completed: ${JSON.stringify(data)}`);
      },
    },

    // Skill Plugin
    {
      type: 'skill',
      name: 'calculator',
      description: 'Perform basic calculations',
      triggers: ['calculate', 'compute', 'math'],
      execute: async (input, context) => {
        try {
          // Simple eval for demo (use proper parser in production)
          const result = eval(input.replace(/[^0-9+\-*/().\s]/g, ''));
          return {
            success: true,
            output: `Result: ${result}`,
            data: { result },
          };
        } catch (error) {
          return {
            success: false,
            error: 'Invalid expression',
          };
        }
      },
    },
  ];
};
