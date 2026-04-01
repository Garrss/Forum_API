/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * UP: membuat tabel replies
 */
export const up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    // eslint-disable-next-line camelcase
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'comments(id)',
      onDelete: 'CASCADE',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    // eslint-disable-next-line camelcase
    is_delete: {
      type: 'BOOLEAN',
      default: false,
    },
    date: {
      type: 'TIMESTAMPTZ',
      default: pgm.func('NOW()'),
    },
  });
};

/**
 * DOWN: rollback (hapus tabel)
 */
export const down = (pgm) => {
  pgm.dropTable('replies');
};
