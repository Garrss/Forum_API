/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * UP: membuat tabel comments
 */
export const up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'TEXT',
      primaryKey: true,
    },
    // eslint-disable-next-line camelcase
    thread_id: {
      type: 'TEXT',
      notNull: true,
      references: 'threads(id)',
      onDelete: 'CASCADE',
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'TEXT',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    date: {
      type: 'TIMESTAMP',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    // eslint-disable-next-line camelcase
    is_delete: {
      type: 'BOOLEAN',
      default: false,
    },
  });
};

/**
 * DOWN: rollback (hapus tabel)
 */
export const down = (pgm) => {
  pgm.dropTable('comments');
};
