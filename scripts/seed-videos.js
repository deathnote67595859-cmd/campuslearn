/**
 * CampusLearn Video Library Seed Script (JavaScript version)
 *
 * Run with: node scripts/seed-videos.js
 *
 * Safety:
 * - Idempotent: won't create duplicate videoUrls
 * - Never deletes existing resources or users
 */

const fs = require('fs');
const path = require('path');

// ─── Load DATABASE_URL from .env if not in environment ─────────────────────
if (!process.env.DATABASE_URL) {
  const envFile = path.join(process.cwd(), '.env');
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DATABASE_URL=') && !trimmed.startsWith('#')) {
        const val = trimmed.slice('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
        // Strip channel_binding and use non-pooler URL for direct connection from Node
        const directUrl = val
          .replace('-pooler.', '.')
          .replace(/[&?]channel_binding=[^&\s"']+/g, '')
          .replace(/[&?]pgbouncer=[^&\s"']+/g, '');
        process.env.DATABASE_URL = directUrl;
        break;
      }
    }
  }
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['error', 'warn'] });

// ─── Subject name → DB record map ─────────────────────────────────────────
const subjectMap = {};

// ─── Desired subjects to create if not present ─────────────────────────────
const DESIRED_SUBJECTS = [
  { name: 'C++',               code: 'CS 106L', color: 'blue',    iconName: 'Code2' },
  { name: 'Data Structures',   code: 'CS 106B', color: 'purple',  iconName: 'Database' },
  { name: 'Mathematics',       code: 'MATH 51', color: 'green',   iconName: 'Calculator' },
  { name: 'Physics',           code: 'PHYS 41', color: 'orange',  iconName: 'Atom' },
  { name: 'Computer Networks', code: 'CS 144',  color: 'red',     iconName: 'Network' },
  { name: 'Web Development',   code: 'WEB 101', color: 'cyan',    iconName: 'Globe' },
  { name: 'Database Systems',  code: 'CS 245',  color: 'amber',   iconName: 'Server' },
  { name: 'Operating Systems', code: 'CS 212',  color: 'rose',    iconName: 'Cpu' },
  { name: 'Algorithms',        code: 'CS 161',  color: 'indigo',  iconName: 'TrendingUp' },
];

const VIDEOS = [
  // ── C / C++ PROGRAMMING ─────────────────────────────────────────────────
  {
    title: 'C Programming for Beginners — Full Course',
    description: 'Beginner-friendly complete C programming course covering syntax, data types, loops, functions, pointers, and file I/O. Produced by freeCodeCamp.',
    videoUrl: 'https://www.youtube.com/watch?v=KJgsSFOSQv0',
    subject: 'C++', courseCode: 'CS 106L', topic: 'C Fundamentals',
  },
  {
    title: 'C Programming Tutorial for Beginners',
    description: 'Structured introduction to C programming with hands-on examples covering variables, control flow, arrays, strings, and functions.',
    videoUrl: 'https://www.youtube.com/watch?v=87SH2Cn0s9A',
    subject: 'C++', courseCode: 'CS 106L', topic: 'C Fundamentals',
  },
  {
    title: 'C++ Programming Course — Beginner to Advanced',
    description: 'Comprehensive C++ course from freeCodeCamp covering OOP, templates, STL, and modern C++11/17 features with over 31 hours of content.',
    videoUrl: 'https://www.youtube.com/watch?v=8jLOx1hD3_o',
    subject: 'C++', courseCode: 'CS 106L', topic: 'C++ Introduction',
  },
  {
    title: 'C++ Full Course for Beginners',
    description: 'Full C++ programming tutorial covering Hello World through classes, inheritance, polymorphism, and file handling.',
    videoUrl: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y',
    subject: 'C++', courseCode: 'CS 106L', topic: 'C++ Introduction',
  },
  {
    title: 'C++ Standard Template Library (STL) Full Course',
    description: 'Deep dive into the C++ STL covering vectors, maps, sets, iterators, algorithms, and best practices for competitive programming.',
    videoUrl: 'https://www.youtube.com/watch?v=RRVYpIET_RU',
    subject: 'C++', courseCode: 'CS 106L', topic: 'STL',
  },
  {
    title: 'Object-Oriented Programming in C++',
    description: 'Detailed OOP in C++ covering classes, objects, encapsulation, inheritance, polymorphism, and virtual functions with examples.',
    videoUrl: 'https://www.youtube.com/watch?v=wN0x9eZLix4',
    subject: 'C++', courseCode: 'CS 106L', topic: 'OOP in C++',
  },
  {
    title: 'Pointers in C — Complete Tutorial',
    description: 'Complete tutorial on pointers in C: memory addresses, pointer variables, pointer arithmetic, arrays and pointers, and function pointers.',
    videoUrl: 'https://www.youtube.com/watch?v=zuegQmMdy8M',
    subject: 'C++', courseCode: 'CS 106L', topic: 'Pointers in C',
  },
  {
    title: 'Arrays and Strings in C',
    description: 'Comprehensive coverage of arrays and strings in C including 1D/2D arrays, string manipulation functions, and character handling.',
    videoUrl: 'https://www.youtube.com/watch?v=Pgkl2guqouc',
    subject: 'C++', courseCode: 'CS 106L', topic: 'Arrays and Strings',
  },
  {
    title: 'Functions and Recursion in C',
    description: 'Understanding functions in C: declaration, definition, parameter passing, return values, and recursive function design with examples.',
    videoUrl: 'https://www.youtube.com/watch?v=_6QAZK3c8mA',
    subject: 'C++', courseCode: 'CS 106L', topic: 'Functions and Recursion',
  },
  {
    title: 'File Handling in C — Complete Tutorial',
    description: 'File I/O in C: fopen, fclose, fread, fwrite, fscanf, fprintf, sequential and random file access with practical examples.',
    videoUrl: 'https://www.youtube.com/watch?v=ZCMzRRFKNEA',
    subject: 'C++', courseCode: 'CS 106L', topic: 'File Handling in C',
  },

  // ── DATA STRUCTURES & ALGORITHMS ─────────────────────────────────────────
  {
    title: 'Data Structures Full Course — freeCodeCamp',
    description: 'Complete data structures course covering arrays, linked lists, stacks, queues, trees, heaps, graphs, and hash tables in C++.',
    videoUrl: 'https://www.youtube.com/watch?v=B31LgI4Y4DQ',
    subject: 'Data Structures', courseCode: 'CS 106B', topic: 'Data Structures Overview',
  },
  {
    title: 'Algorithms and Data Structures — Full University Course',
    description: 'University-level algorithms and data structures course from freeCodeCamp covering analysis, sorting, searching, and graph algorithms.',
    videoUrl: 'https://www.youtube.com/watch?v=8hly31xKli0',
    subject: 'Algorithms', courseCode: 'CS 161', topic: 'Algorithm Analysis',
  },
  {
    title: 'Arrays and Linked Lists — Data Structures Explained',
    description: 'Side-by-side comparison of arrays and linked lists: operations, time complexity, memory layout, and when to use each.',
    videoUrl: 'https://www.youtube.com/watch?v=9YddVVsdG5A',
    subject: 'Data Structures', courseCode: 'CS 106B', topic: 'Arrays and Linked Lists',
  },
  {
    title: 'Stacks and Queues — Data Structures',
    description: 'Understanding stacks (LIFO) and queues (FIFO): implementation using arrays and linked lists, real-world applications, and time complexity.',
    videoUrl: 'https://www.youtube.com/watch?v=A3ZUpyrnCbM',
    subject: 'Data Structures', courseCode: 'CS 106B', topic: 'Stacks and Queues',
  },
  {
    title: 'Trees and Binary Search Trees',
    description: 'Introduction to trees, binary trees, binary search trees, traversal algorithms (inorder, preorder, postorder), and BST operations.',
    videoUrl: 'https://www.youtube.com/watch?v=oSWTXtMglKE',
    subject: 'Data Structures', courseCode: 'CS 106B', topic: 'Binary Trees and BST',
  },
  {
    title: 'Graph Data Structures — Full Tutorial',
    description: 'Complete guide to graph data structures: directed and undirected graphs, adjacency matrix/list, BFS, DFS, and common applications.',
    videoUrl: 'https://www.youtube.com/watch?v=tWVWeAqZ0WU',
    subject: 'Data Structures', courseCode: 'CS 106B', topic: 'Graphs',
  },
  {
    title: 'Sorting Algorithms — Visual Guide',
    description: 'Visual explanation of bubble, selection, insertion, merge, quick, and heap sort algorithms with time and space complexity analysis.',
    videoUrl: 'https://www.youtube.com/watch?v=g-PGLbMth_g',
    subject: 'Algorithms', courseCode: 'CS 161', topic: 'Sorting Algorithms',
  },
  {
    title: 'Searching Algorithms — Binary and Linear Search',
    description: 'Detailed walkthrough of linear search, binary search, and their time complexities, along with implementation in multiple languages.',
    videoUrl: 'https://www.youtube.com/watch?v=C46QfTjVCNU',
    subject: 'Algorithms', courseCode: 'CS 161', topic: 'Searching Algorithms',
  },
  {
    title: 'Recursion and Backtracking — Full Tutorial',
    description: 'Comprehensive tutorial on recursion: base cases, recursive thinking, backtracking, N-Queens problem, maze solving, and memoization.',
    videoUrl: 'https://www.youtube.com/watch?v=IJDJ0kBx2LM',
    subject: 'Algorithms', courseCode: 'CS 161', topic: 'Recursion and Backtracking',
  },
  {
    title: 'Dynamic Programming — Full Course',
    description: 'Complete dynamic programming tutorial: memoization, tabulation, and classic DP problems including knapsack, LCS, LIS, and coin change.',
    videoUrl: 'https://www.youtube.com/watch?v=oBt53YbR9Kk',
    subject: 'Algorithms', courseCode: 'CS 161', topic: 'Dynamic Programming',
  },

  // ── WEB DEVELOPMENT ───────────────────────────────────────────────────────
  {
    title: 'HTML and CSS Full Course for Beginners',
    description: 'Beginner-to-intermediate HTML and CSS course from Dave Gray covering semantic HTML5, Flexbox, Grid, and responsive design fundamentals.',
    videoUrl: 'https://www.youtube.com/watch?v=mU6anWqZJcc',
    subject: 'Web Development', courseCode: 'WEB 101', topic: 'HTML and CSS Basics',
  },
  {
    title: 'HTML5 and CSS3 Full Course',
    description: 'Modern HTML5 and CSS3 course covering layouts, forms, the box model, media queries, and building a real responsive website from scratch.',
    videoUrl: 'https://www.youtube.com/watch?v=G3e-cpL7ofc',
    subject: 'Web Development', courseCode: 'WEB 101', topic: 'HTML5 and CSS3',
  },
  {
    title: 'JavaScript Full Course for Beginners',
    description: 'Complete JavaScript course covering variables, functions, DOM manipulation, events, ES6+ features, async/await, and practical projects.',
    videoUrl: 'https://www.youtube.com/watch?v=jS4aFq5-91M',
    subject: 'Web Development', courseCode: 'WEB 101', topic: 'JavaScript Fundamentals',
  },
  {
    title: 'JavaScript Algorithms and Data Structures — freeCodeCamp',
    description: 'freeCodeCamp JavaScript algorithms course covering sorting, searching, BigO notation, recursion, and common coding interview problems.',
    videoUrl: 'https://www.youtube.com/watch?v=t2CEgPsws3U',
    subject: 'Web Development', courseCode: 'WEB 101', topic: 'JavaScript Algorithms',
  },
  {
    title: 'Responsive Web Design Full Course',
    description: 'Build fully responsive websites using CSS Flexbox, Grid, media queries, and mobile-first design principles with real project examples.',
    videoUrl: 'https://www.youtube.com/watch?v=srvUrASNj0s',
    subject: 'Web Development', courseCode: 'WEB 101', topic: 'Responsive Design',
  },
  {
    title: 'Git and GitHub for Beginners — Crash Course',
    description: 'Learn Git and GitHub from scratch: initialization, commits, branches, merging, pull requests, and collaborative development workflows.',
    videoUrl: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
    subject: 'Web Development', courseCode: 'WEB 101', topic: 'Git and GitHub',
  },
  {
    title: 'React JS Full Course for Beginners',
    description: 'Complete React.js course from freeCodeCamp covering components, state, props, hooks (useState, useEffect, useContext), and building a full app.',
    videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    subject: 'Web Development', courseCode: 'WEB 101', topic: 'React JS',
  },
  {
    title: 'Node.js Full Course for Beginners',
    description: 'Introduction to Node.js and Express: event loop, modules, file system, HTTP servers, REST APIs, and connecting to a database.',
    videoUrl: 'https://www.youtube.com/watch?v=f2EqECiTBL8',
    subject: 'Web Development', courseCode: 'WEB 101', topic: 'Node.js',
  },
  {
    title: 'REST API Development — Full Tutorial',
    description: 'Build RESTful APIs from scratch with Node.js and Express: HTTP methods, routes, middleware, authentication, and best practices.',
    videoUrl: 'https://www.youtube.com/watch?v=l8WPWK9mS5M',
    subject: 'Web Development', courseCode: 'WEB 101', topic: 'REST API',
  },
  {
    title: 'Full-Stack Web Development — MERN Stack Course',
    description: 'Complete full-stack web development course using MongoDB, Express, React, and Node.js (MERN) to build a production-ready application.',
    videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
    subject: 'Web Development', courseCode: 'WEB 101', topic: 'Full-Stack Development',
  },

  // ── DBMS / SQL ────────────────────────────────────────────────────────────
  {
    title: 'Database Management System (DBMS) — Full Course',
    description: 'Complete DBMS course covering relational model, ER diagrams, normalization, SQL, transactions, concurrency control, and indexing.',
    videoUrl: 'https://www.youtube.com/watch?v=6Iu45VZGQDke',
    subject: 'Database Systems', courseCode: 'CS 245', topic: 'DBMS Overview',
  },
  {
    title: 'SQL Full Course — Learn SQL in 4 Hours',
    description: 'Comprehensive SQL tutorial covering SELECT, WHERE, JOIN, GROUP BY, subqueries, views, stored procedures, and transactions.',
    videoUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    subject: 'Database Systems', courseCode: 'CS 245', topic: 'SQL Fundamentals',
  },
  {
    title: 'SQL for Beginners Tutorial',
    description: 'Beginner-level SQL tutorial covering database creation, INSERT, SELECT, UPDATE, DELETE, and basic query writing with MySQL.',
    videoUrl: 'https://www.youtube.com/watch?v=9ylj9NR0Lcg',
    subject: 'Database Systems', courseCode: 'CS 245', topic: 'SQL Basics',
  },
  {
    title: 'Database Normalization — 1NF, 2NF, 3NF, BCNF Explained',
    description: 'Clear explanation of database normalization: functional dependencies, 1NF, 2NF, 3NF, and BCNF with worked examples to eliminate redundancy.',
    videoUrl: 'https://www.youtube.com/watch?v=GFQaEYEc8_8',
    subject: 'Database Systems', courseCode: 'CS 245', topic: 'Database Normalization',
  },
  {
    title: 'ER Diagrams and Database Design',
    description: 'How to design relational databases using Entity-Relationship diagrams: entities, attributes, relationships, cardinality, and mapping to tables.',
    videoUrl: 'https://www.youtube.com/watch?v=QpdhBUYk7Kk',
    subject: 'Database Systems', courseCode: 'CS 245', topic: 'ER Diagrams',
  },
  {
    title: 'SQL Joins Explained — INNER, LEFT, RIGHT, FULL JOIN',
    description: 'Visual guide to all SQL JOIN types: INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN with Venn diagram explanations and real examples.',
    videoUrl: 'https://www.youtube.com/watch?v=9yeOJ0ZMUYw',
    subject: 'Database Systems', courseCode: 'CS 245', topic: 'SQL Joins',
  },
  {
    title: 'Transactions and ACID Properties in Databases',
    description: 'Understanding database transactions and ACID properties (Atomicity, Consistency, Isolation, Durability) with concurrency control examples.',
    videoUrl: 'https://www.youtube.com/watch?v=pomxJOFVcQs',
    subject: 'Database Systems', courseCode: 'CS 245', topic: 'Transactions and ACID',
  },
  {
    title: 'PostgreSQL Tutorial for Beginners',
    description: 'Introduction to PostgreSQL: installation, psql CLI, creating databases and tables, basic queries, indexes, and common database operations.',
    videoUrl: 'https://www.youtube.com/watch?v=qw--VYLpxG4',
    subject: 'Database Systems', courseCode: 'CS 245', topic: 'PostgreSQL',
  },

  // ── COMPUTER NETWORKS ─────────────────────────────────────────────────────
  {
    title: 'Computer Networks Full Course',
    description: 'Complete computer networks course covering data communication, OSI and TCP/IP models, protocols, routing, and network security concepts.',
    videoUrl: 'https://www.youtube.com/watch?v=IPvYjXCsTg8',
    subject: 'Computer Networks', courseCode: 'CS 144', topic: 'Network Fundamentals',
  },
  {
    title: 'OSI Model Explained — 7 Layers of Networking',
    description: 'Clear breakdown of the OSI 7-layer model: Physical, Data Link, Network, Transport, Session, Presentation, and Application layers with examples.',
    videoUrl: 'https://www.youtube.com/watch?v=vv4y_uOneC0',
    subject: 'Computer Networks', courseCode: 'CS 144', topic: 'OSI Model',
  },
  {
    title: 'TCP/IP Model Explained',
    description: "Understanding the 4-layer TCP/IP model and how it maps to the OSI model, with explanation of each layer's function and key protocols.",
    videoUrl: 'https://www.youtube.com/watch?v=OTwp3xtd4dg',
    subject: 'Computer Networks', courseCode: 'CS 144', topic: 'TCP/IP Model',
  },
  {
    title: 'IP Addressing and Subnetting — Full Tutorial',
    description: 'Comprehensive guide to IPv4 addressing, subnet masks, CIDR notation, subnetting calculations, and practical network design examples.',
    videoUrl: 'https://www.youtube.com/watch?v=s_gy5oR_RBA',
    subject: 'Computer Networks', courseCode: 'CS 144', topic: 'IP Addressing and Subnetting',
  },
  {
    title: 'TCP vs UDP — Key Differences Explained',
    description: 'Side-by-side comparison of TCP (reliable, connection-oriented) and UDP (fast, connectionless) with real-world protocol usage examples.',
    videoUrl: 'https://www.youtube.com/watch?v=uwoD5YsGACg',
    subject: 'Computer Networks', courseCode: 'CS 144', topic: 'TCP vs UDP',
  },
  {
    title: 'HTTP and HTTPS Explained',
    description: 'How HTTP and HTTPS work: request-response cycle, methods (GET, POST, PUT, DELETE), status codes, cookies, and TLS/SSL encryption.',
    videoUrl: 'https://www.youtube.com/watch?v=iYM2zFP3Zn0',
    subject: 'Computer Networks', courseCode: 'CS 144', topic: 'HTTP and HTTPS',
  },
  {
    title: 'DNS Explained — How Domain Name System Works',
    description: 'How DNS translates domain names to IP addresses: DNS hierarchy, recursive resolvers, root servers, caching, and common record types.',
    videoUrl: 'https://www.youtube.com/watch?v=27r4Bzuj5NQ',
    subject: 'Computer Networks', courseCode: 'CS 144', topic: 'DNS',
  },

  // ── OPERATING SYSTEMS ────────────────────────────────────────────────────
  {
    title: 'Operating Systems — Full Course',
    description: 'Complete OS course covering process management, scheduling, memory management, file systems, deadlocks, and I/O management.',
    videoUrl: 'https://www.youtube.com/watch?v=mXw9ruZaxzY',
    subject: 'Operating Systems', courseCode: 'CS 212', topic: 'OS Overview',
  },
  {
    title: 'Processes and Threads in Operating Systems',
    description: 'Understanding processes and threads: process states, PCB, context switching, thread models, multithreading benefits, and synchronization.',
    videoUrl: 'https://www.youtube.com/watch?v=4rLW7zg21gI',
    subject: 'Operating Systems', courseCode: 'CS 212', topic: 'Processes and Threads',
  },
  {
    title: 'CPU Scheduling Algorithms — FCFS, SJF, Round Robin',
    description: 'Detailed walkthrough of CPU scheduling: FCFS, SJF, Priority, Round Robin, and Multilevel Queue scheduling with Gantt chart calculations.',
    videoUrl: 'https://www.youtube.com/watch?v=EWkQl0n0w5M',
    subject: 'Operating Systems', courseCode: 'CS 212', topic: 'CPU Scheduling',
  },
  {
    title: 'Memory Management in Operating Systems',
    description: 'OS memory management concepts: contiguous allocation, paging, segmentation, virtual memory, page replacement algorithms, and thrashing.',
    videoUrl: 'https://www.youtube.com/watch?v=qlH4-oHnBb8',
    subject: 'Operating Systems', courseCode: 'CS 212', topic: 'Memory Management',
  },
  {
    title: "Deadlocks in Operating Systems",
    description: "Understanding deadlocks: necessary conditions (Coffman conditions), deadlock prevention, avoidance (Banker's algorithm), detection, and recovery.",
    videoUrl: 'https://www.youtube.com/watch?v=UVo9mGARkhQ',
    subject: 'Operating Systems', courseCode: 'CS 212', topic: 'Deadlocks',
  },

  // ── MATHEMATICS ──────────────────────────────────────────────────────────
  {
    title: 'Calculus 1 — Full College Course',
    description: "Complete Calculus 1 from freeCodeCamp: limits, derivatives, chain rule, optimization, L'Hopital's rule, and an introduction to integrals.",
    videoUrl: 'https://www.youtube.com/watch?v=HfACrKJ_Y2w',
    subject: 'Mathematics', courseCode: 'MATH 51', topic: 'Calculus',
  },
  {
    title: 'Differential Equations — Full Course',
    description: 'Introduction to differential equations: first-order ODEs, separation of variables, linear equations, Laplace transforms, and applications.',
    videoUrl: 'https://www.youtube.com/watch?v=p_di4Zn4wz4',
    subject: 'Mathematics', courseCode: 'MATH 51', topic: 'Differential Equations',
  },
  {
    title: 'Linear Algebra — Full College Course',
    description: 'Comprehensive linear algebra from freeCodeCamp: vectors, matrices, determinants, eigenvalues, eigenvectors, and linear transformations.',
    videoUrl: 'https://www.youtube.com/watch?v=JnTa9XtvmfI',
    subject: 'Mathematics', courseCode: 'MATH 51', topic: 'Linear Algebra',
  },
  {
    title: 'Probability and Statistics — Full Course',
    description: "Complete probability and statistics course: sample spaces, Bayes' theorem, distributions, hypothesis testing, and regression analysis.",
    videoUrl: 'https://www.youtube.com/watch?v=sbbYntt5CJk',
    subject: 'Mathematics', courseCode: 'MATH 51', topic: 'Probability and Statistics',
  },
  {
    title: 'Discrete Mathematics — Full Course for Computer Science',
    description: 'Discrete math fundamentals for CS: logic, set theory, functions, relations, graph theory, combinatorics, and mathematical induction.',
    videoUrl: 'https://www.youtube.com/watch?v=A3Ffwsnad0k',
    subject: 'Mathematics', courseCode: 'MATH 51', topic: 'Discrete Mathematics',
  },

  // ── PHYSICS ──────────────────────────────────────────────────────────────
  {
    title: 'Classical Mechanics — MIT OpenCourseWare 8.01',
    description: "MIT 8.01 Physics I: Classical Mechanics. Covers kinematics, Newton's laws, energy, momentum, rotation, oscillations, and gravitation.",
    videoUrl: 'https://www.youtube.com/watch?v=wWnfJ0-xXRE',
    subject: 'Physics', courseCode: 'PHYS 41', topic: 'Classical Mechanics',
  },
  {
    title: 'Electricity and Magnetism — Lecture Series',
    description: "Introduction to electrostatics, electric fields, Coulomb's law, Gauss's law, magnetic fields, Faraday's law, and Maxwell's equations.",
    videoUrl: 'https://www.youtube.com/watch?v=rtlJoXR9zFc',
    subject: 'Physics', courseCode: 'PHYS 41', topic: 'Electricity and Magnetism',
  },
  {
    title: 'Waves and Oscillations — Physics Lecture',
    description: 'Understanding simple harmonic motion, pendulums, mechanical waves, superposition, standing waves, and sound wave properties.',
    videoUrl: 'https://www.youtube.com/watch?v=tJW_a6JeXD8',
    subject: 'Physics', courseCode: 'PHYS 41', topic: 'Waves and Oscillations',
  },
  {
    title: 'Thermodynamics — Full Physics Course',
    description: 'Complete thermodynamics course: temperature, heat, laws of thermodynamics, entropy, Carnot cycle, ideal gas, and heat engines.',
    videoUrl: 'https://www.youtube.com/watch?v=4i1MUWJoI0U',
    subject: 'Physics', courseCode: 'PHYS 41', topic: 'Thermodynamics',
  },
  {
    title: 'Modern Physics — Special Relativity and Quantum Mechanics',
    description: 'Introduction to modern physics: special relativity, time dilation, mass-energy equivalence, photoelectric effect, and wave-particle duality.',
    videoUrl: 'https://www.youtube.com/watch?v=AwhKZ3fd9JA',
    subject: 'Physics', courseCode: 'PHYS 41', topic: 'Modern Physics',
  },
];

function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function main() {
  console.log('CampusLearn Video Seed Script Starting...\n');

  // ── 1. Find an uploader ──────────────────────────────────────────────────
  let uploader = await prisma.user.findFirst({
    where: { role: { in: ['TEACHER', 'ADMIN'] } },
    orderBy: { createdAt: 'asc' },
  });
  if (!uploader) {
    uploader = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  }
  if (!uploader) {
    throw new Error('No users found in the database. Create a user first.');
  }
  console.log('Using uploader: ' + uploader.name + ' (' + uploader.role + ')\n');

  // ── 2. Fetch existing subjects & create missing ──────────────────────────
  const existingSubjects = await prisma.subject.findMany();
  for (const s of existingSubjects) {
    subjectMap[s.name] = { id: s.id, name: s.name };
  }
  console.log('Existing subjects (' + existingSubjects.length + '):', Object.keys(subjectMap).join(', '));

  for (const desired of DESIRED_SUBJECTS) {
    if (!subjectMap[desired.name]) {
      console.log('Creating subject: ' + desired.name);
      const created = await prisma.subject.create({
        data: { name: desired.name, code: desired.code, color: desired.color, iconName: desired.iconName },
      });
      subjectMap[desired.name] = { id: created.id, name: created.name };
    }
  }
  console.log('Total subjects after setup: ' + Object.keys(subjectMap).length + '\n');

  // ── 3. Existing video URLs to avoid duplicates ───────────────────────────
  const existingVideos = await prisma.resource.findMany({
    where: { type: 'VIDEO' },
    select: { videoUrl: true, title: true },
  });
  const existingUrls = new Set(existingVideos.map(v => (v.videoUrl || '').trim()));
  console.log('Existing video resources: ' + existingVideos.length);
  if (existingVideos.length > 0) {
    console.log('Existing video titles:');
    existingVideos.forEach(v => console.log('  - ' + v.title));
  }

  // ── 4. Insert new videos ─────────────────────────────────────────────────
  let created = 0, skipped = 0, errors = 0;
  console.log('\nInserting ' + VIDEOS.length + ' videos...\n');

  for (const video of VIDEOS) {
    const normalizedUrl = video.videoUrl.trim();

    if (existingUrls.has(normalizedUrl)) {
      console.log('  SKIP (duplicate): ' + video.title);
      skipped++;
      continue;
    }

    const ytId = extractYouTubeId(normalizedUrl);
    if (!ytId) {
      console.error('  ERROR: Bad YouTube URL: ' + normalizedUrl);
      errors++;
      continue;
    }

    const subjectRecord = subjectMap[video.subject];
    if (!subjectRecord) {
      console.error('  ERROR: Subject not found: "' + video.subject + '" for "' + video.title + '"');
      errors++;
      continue;
    }

    try {
      await prisma.resource.create({
        data: {
          title: video.title,
          description: video.description,
          type: 'VIDEO',
          videoUrl: normalizedUrl,
          topic: video.topic,
          courseCode: video.courseCode,
          isPublic: true,
          subjectId: subjectRecord.id,
          userId: uploader.id,
        },
      });
      existingUrls.add(normalizedUrl);
      console.log('  OK: ' + video.title);
      created++;
    } catch (err) {
      console.error('  ERROR creating "' + video.title + '": ' + err.message);
      errors++;
    }
  }

  // ── 5. Summary ────────────────────────────────────────────────────────────
  console.log('\n=== SEED COMPLETE ===');
  console.log('Videos created:  ' + created);
  console.log('Videos skipped:  ' + skipped + ' (already existed)');
  console.log('Errors:          ' + errors);
  console.log('Total in script: ' + VIDEOS.length);

  const totalVideos = await prisma.resource.count({ where: { type: 'VIDEO' } });
  const totalSubjects = await prisma.subject.count();
  console.log('\nTotal VIDEO resources in DB: ' + totalVideos);
  console.log('Total subjects in DB:        ' + totalSubjects);
}

main()
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

