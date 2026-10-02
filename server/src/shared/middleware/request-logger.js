import morgan from 'morgan';

// Keep test output readable; Jest sets NODE_ENV=test
const requestLogger = morgan('dev', { skip: () => process.env.NODE_ENV === 'test' });

export default requestLogger;
