import type { Question } from '../../types'

export const storageQuiz: Question[] = [
  {
    kind: 'mcq',
    id: 'sto-inode-name',
    prompt: 'Where is a file\'s name stored in a Unix-style file system?',
    options: ['In the inode', 'In the directory entry that points to the inode', 'In the superblock', 'In the first data block'],
    answer: 1,
    explanation: 'Inodes hold metadata and block pointers but no name. Directories map names to inode numbers, which is why one inode can have several names (hard links).',
  },
  {
    kind: 'mcq',
    id: 'sto-linked-random',
    prompt: 'Which allocation method makes random access (e.g. reading block 900 of a file) slowest?',
    options: ['Contiguous', 'Linked', 'Indexed', 'They are all equal'],
    answer: 1,
    explanation: 'With linked allocation you must follow 899 next-pointers, each a disk read. Contiguous computes the address directly, and indexed looks it up in the index block.',
  },
  {
    kind: 'mcq',
    id: 'sto-contig-grow',
    prompt: 'What is the main problem with contiguous allocation?',
    options: [
      'Sequential reads are slow',
      'Files are hard to grow and free space fragments',
      'It needs an index block per file',
      'It cannot store directories',
    ],
    answer: 1,
    explanation: 'Sequential and random access are both fast, but a file can only grow if the next block is free, and deleting files leaves holes that may be too small for new files (external fragmentation).',
  },
  {
    kind: 'predict',
    id: 'sto-sstf',
    prompt: 'Using SSTF, what is the total head movement (in cylinders)?',
    scenario: 'Head at cylinder 50\nRequests: 45, 70, 90, 10',
    answer: 130,
    unit: 'cylinders',
    explanation: 'SSTF always serves the closest request: 50 -> 45 (5), then 70 (25, closer than 10 at 35), then 90 (20), then all the way back to 10 (80). Total = 5 + 25 + 20 + 80 = 130.',
  },
  {
    kind: 'order',
    id: 'sto-open-read',
    prompt: 'Order what happens when a program opens and reads /home/notes.txt.',
    items: [
      'Look up "home" in the root directory to get its inode',
      'Look up "notes.txt" in the /home directory to get its inode',
      'Read the inode to find the file\'s data block numbers',
      'Read the data blocks from disk (or the page cache)',
      'Copy the bytes into the program\'s buffer',
    ],
    explanation: 'Path resolution walks one directory at a time from the root, each step translating a name to an inode. The final inode tells the file system which blocks hold the data.',
  },
  {
    kind: 'mcq',
    id: 'sto-delete',
    prompt: 'When you delete a file, what usually happens to its data on disk?',
    options: [
      'It is overwritten with zeros immediately',
      'The blocks are marked free in the bitmap but the bytes stay until reused',
      'It is moved to a hidden partition',
      'The disk sectors are physically removed',
    ],
    answer: 1,
    explanation: 'Deletion just removes the directory entry, frees the inode and marks blocks free. The old bytes remain until overwritten, which is why undelete tools (and secure-erase tools) exist.',
  },
]
