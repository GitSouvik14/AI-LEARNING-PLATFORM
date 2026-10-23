export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  mnemonicRetentionTip: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

export interface InteractiveSandboxConfig {
  type: 'classifier' | 'weights' | 'tokens' | 'vision_kernel' | 'ethics_bias';
  title: string;
  description: string;
  initialState: Record<string, any>;
}

export interface LessonModule {
  id: string;
  title: string;
  shortDescription: string;
  durationMinutes: number;
  xpReward: number;
  sections: {
    heading: string;
    content: string;
    analogy?: string;
    codeSnippet?: string;
  }[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  sandbox?: InteractiveSandboxConfig;
}

export interface Course {
  id: string;
  title: string;
  category: 'foundations' | 'deep_learning' | 'nlp' | 'vision' | 'ethics' | 'edge_ml';
  level: 'Beginner' | 'Intermediate' | 'Applied';
  icon: string;
  tagline: string;
  description: string;
  imageUrl: string;
  accentColor: string;
  modules: LessonModule[];
}

export const COURSES: Course[] = [
  {
    id: 'ai-foundations',
    title: 'Foundations of AI & Prompt Engineering',
    category: 'foundations',
    level: 'Beginner',
    icon: 'Sparkles',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-cyan-500 to-blue-600',
    tagline: 'Master the fundamental concepts of Artificial Intelligence from zero math fear to hands-on intuition.',
    description: 'Understand the difference between Rules-Based Code and Machine Learning, how modern generative models interpret prompts, and build your intuitive foundation.',
    modules: [
      {
        id: 'mod-1-1',
        title: '1. What is AI, Machine Learning & Deep Learning?',
        shortDescription: 'Unpack the mental models and debunk the hype surrounding modern AI.',
        durationMinutes: 12,
        xpReward: 100,
        sections: [
          {
            heading: 'The Big Picture: AI vs Machine Learning',
            content: 'Traditional computer programming is like writing a strict recipe: "If ingredient A is present, do action B." Artificial Intelligence, however, is a broader umbrella where machines perform tasks that normally require human intelligence. Machine Learning (ML) is the specific technique where algorithms learn the rules themselves by observing thousands of examples, rather than being explicitly coded.',
            analogy: 'Traditional programming is like a chef following a recipe book step-by-step. Machine Learning is like an apprentice tasting 10,000 soups and figuring out what combination of spices makes a soup delicious on their own.',
          },
          {
            heading: 'The Three Main Flavors of Learning',
            content: '1. Supervised Learning: Learning with labeled answer keys (e.g. photos of apples vs oranges with labels).\n2. Unsupervised Learning: Finding hidden patterns without labels (e.g. clustering customers by purchasing habits).\n3. Reinforcement Learning: Learning through trial and error with reward penalties (e.g. a robot learning to walk or an AI mastering chess).',
            analogy: 'Supervised is studying with flashcards that have answers on the back. Unsupervised is sorting a basket of mixed fruits into piles by shape without knowing fruit names. Reinforcement is learning to ride a bike by keeping balance and not falling over.',
          },
          {
            heading: 'How Data Becomes Knowledge',
            content: 'In Machine Learning, we split datasets into "Features" (inputs like house size, number of rooms) and "Labels" (the target we want to predict, like house price). We also split data into Training data (70-80%) and Test data (20-30%) to ensure the model can generalize to brand new situations it hasn\'t memorized.',
            codeSnippet: '# Minimal Python concept of a Supervised Model:\nfrom sklearn.linear_model import LinearRegression\n\n# Features: [Square Feet, Bedrooms]\nX = [[1000, 2], [1500, 3], [2000, 4]]\n# Target Labels: Price in $k\ny = [200, 310, 420]\n\nmodel = LinearRegression()\nmodel.fit(X, y)  # Learns the pattern\nprediction = model.predict([[1200, 2]])\nprint(f"Predicted Price: ${prediction[0]:.1f}k")',
          },
        ],
        quiz: [
          {
            id: 'q1-1',
            question: 'What is the primary difference between traditional programming and machine learning?',
            options: [
              'Traditional programming learns from data; ML requires manually writing all if-else rules',
              'Traditional programming writes explicit rules; ML discovers patterns and rules from data',
              'Traditional programming only works on supercomputers; ML works on paper',
              'There is no difference; they are identical terms',
            ],
            correctAnswerIndex: 1,
            explanation: 'In traditional programming, engineers write the rules by hand. In Machine Learning, the algorithm examines input data and answers to formulate the rules automatically.',
            mnemonicRetentionTip: 'Rules First = Traditional Code. Data First = Machine Learning!',
          },
          {
            id: 'q1-2',
            question: 'Why do we hold out a separate "Test Set" of data when training an AI model?',
            options: [
              'To save storage space on the computer hard drive',
              'Because the AI cannot handle all the data at once',
              'To check if the AI truly generalized to new unseen data rather than just memorized answers',
              'To delete it after training is finished',
            ],
            correctAnswerIndex: 2,
            explanation: 'Just like testing a student with new exam questions they have not seen before, the test set verifies genuine understanding rather than mere rote memorization.',
            mnemonicRetentionTip: 'Train to Learn, Test to Verify (Never test on homework problems)!',
          },
        ],
        flashcards: [
          {
            id: 'fc-1-1',
            front: 'Supervised Learning',
            back: 'A type of ML where the algorithm is provided with input features paired with correct target labels (e.g. photos labeled "cat" or "dog").',
            category: 'Definitions',
          },
          {
            id: 'fc-1-2',
            front: 'Generalization',
            back: 'The ability of an AI model to make accurate predictions on completely new, unseen data that was not in its training set.',
            category: 'Core Concepts',
          },
        ],
        sandbox: {
          type: 'classifier',
          title: 'Interactive Fruit Classifier',
          description: 'Adjust the fruit weight and color sweetness slider. Watch how the decision boundary updates in real-time to classify Apples vs Oranges!',
          initialState: {
            weight: 150,
            colorHue: 40,
            threshold: 140,
          },
        },
      },
      {
        id: 'mod-1-2',
        title: '2. Prompt Engineering: Communicating with Foundation Models',
        shortDescription: 'Learn how Large Language Models (LLMs) think and formulate prompts that yield high-precision results.',
        durationMinutes: 15,
        xpReward: 120,
        sections: [
          {
            heading: 'How LLMs Process Language',
            content: 'LLMs do not think like humans; they are massive statistical probability engines. Given a prompt, they predict the most likely next "token" (word or word fragment) based on patterns absorbed across billions of texts.',
            analogy: 'Imagine a super-powered autocomplete on your phone that has read the entire Library of Alexandria. The quality of its suggestions depends directly on the context and tone you provide in your sentence opening.',
          },
          {
            heading: 'The 4 Pillars of a Pristine Prompt',
            content: '1. Role/Persona: Who should the model be? (e.g., "Act as a compassionate pediatric nurse...")\n2. Task: Exactly what must be done? ("Explain asthma...")\n3. Constraints: What rules must it follow? ("In under 100 words, using no technical jargon, for an 8-year-old")\n4. Format: How should the output be structured? ("As a numbered 3-step bullet list")',
          },
        ],
        quiz: [
          {
            id: 'q1-3',
            question: 'What is "Few-Shot Prompting"?',
            options: [
              'Asking the model a question only once and never following up',
              'Providing 2 to 3 clear examples of inputs and desired outputs inside your prompt',
              'Typing as few words as possible to save computational power',
              'Restarting the server every time you generate a response',
            ],
            correctAnswerIndex: 1,
            explanation: 'Few-shot prompting provides concrete demonstration examples in the prompt, allowing the model to quickly lock into the desired formatting and reasoning pattern.',
            mnemonicRetentionTip: 'Few-Shot = Give a few shots (examples) of what great looks like!',
          },
        ],
        flashcards: [
          {
            id: 'fc-1-3',
            front: 'Temperature in LLMs',
            back: 'A hyperparameter controlling randomness: lower temperature (0.0-0.2) produces focused, deterministic answers; higher temperature (0.7-1.0) produces creative, varied text.',
            category: 'Prompt Engineering',
          },
        ],
        sandbox: {
          type: 'tokens',
          title: 'Live Tokenizer & Attention Preview',
          description: 'Type a sentence and see how it splits into tokens, sub-words, and probability weights.',
          initialState: {
            text: 'Artificial Intelligence empowers learners worldwide.',
          },
        },
      },
    ],
  },
  {
    id: 'neural-networks',
    title: 'Machine Learning Basics & Neural Networks',
    category: 'deep_learning',
    level: 'Intermediate',
    icon: 'Network',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-purple-500 to-indigo-600',
    tagline: 'Demystify artificial neurons, weights, biases, and backpropagation step-by-step.',
    description: 'Learn how layers of synthetic neurons work together to recognize patterns, calculate error loss, and improve with gradient descent.',
    modules: [
      {
        id: 'mod-2-1',
        title: '1. Anatomy of an Artificial Neuron (Perceptron)',
        shortDescription: 'Explore the building block of all deep learning systems: inputs, weights, bias, and activations.',
        durationMinutes: 18,
        xpReward: 150,
        sections: [
          {
            heading: 'The Formula: Output = Activation(Weights * Inputs + Bias)',
            content: 'Each synthetic neuron receives one or more numeric inputs. It multiplies each input by a "Weight" (which represents how important that input is), adds them all up, adds a "Bias" (an adjustment threshold), and passes the total through an "Activation Function" (like ReLU or Sigmoid) to introduce non-linearity.',
            analogy: 'Deciding whether to attend an outdoor music festival: Inputs might be (Weather is sunny? Ticket is cheap? Friends are going?). You assign higher "weights" to what matters most to you. The bias is your general mood to go out even if some factors are imperfect!',
          },
          {
            heading: 'Activation Functions: Why Non-Linearity Matters',
            content: 'Without activation functions, stacking 100 layers of neurons would simply be equivalent to one big linear regression (y = mx + b). Non-linear functions like ReLU (Rectified Linear Unit: output max(0, x)) allow neural networks to bend, fold, and wrap around complex curved patterns in real-world data.',
          },
        ],
        quiz: [
          {
            id: 'q2-1',
            question: 'What is the purpose of the "Weight" in an artificial neuron?',
            options: [
              'To measure how heavy the computer hardware is',
              'To amplify or dampen the importance of a specific input signal',
              'To turn the network off when it gets too hot',
              'To encrypt the student password',
            ],
            correctAnswerIndex: 1,
            explanation: 'Weights determine the strength and direction (positive or negative) of the connection between inputs and the neuron output.',
            mnemonicRetentionTip: 'Weight = Importance dial for each input!',
          },
          {
            id: 'q2-2',
            question: 'Why is the ReLU activation function (max(0, x)) so widely used in modern deep learning?',
            options: [
              'It turns negative numbers into 0 and passes positive numbers unchanged, making computation fast and preventing gradient vanishing',
              'It turns all inputs into random numbers',
              'It forces the model to only predict negative numbers',
              'It requires no math at all',
            ],
            correctAnswerIndex: 0,
            explanation: 'ReLU is computationally lightweight and allows deep neural networks to learn non-linear patterns without their gradients shrinking into oblivion.',
            mnemonicRetentionTip: 'ReLU: Reject negatives, let positives run free!',
          },
        ],
        flashcards: [
          {
            id: 'fc-2-1',
            front: 'Loss Function (Cost Function)',
            back: 'A mathematical formula that measures the difference between what the neural network predicted and the actual true label. The goal of training is to minimize this loss.',
            category: 'Optimization',
          },
          {
            id: 'fc-2-2',
            front: 'Gradient Descent',
            back: 'An optimization algorithm that iteratively tweaks network weights in the direction that lowers the loss curve, like taking small steps downhill in a foggy valley.',
            category: 'Optimization',
          },
        ],
        sandbox: {
          type: 'weights',
          title: 'Interactive Neuron Weight & Loss Tuner',
          description: 'Manually tweak weights W1, W2 and Bias. Watch the output calculation and loss curve adjust live!',
          initialState: {
            w1: 0.8,
            w2: -0.4,
            bias: 0.2,
            target: 1.0,
          },
        },
      },
    ],
  },
  {
    id: 'nlp-genai',
    title: 'Natural Language Processing & Transformers',
    category: 'nlp',
    level: 'Intermediate',
    icon: 'Brain',
    imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-blue-500 to-violet-600',
    tagline: 'Understand how text transforms into vectors, embeddings, and self-attention mechanisms.',
    description: 'Learn the revolutionary architecture behind modern language models: word embeddings, tokenization, and self-attention.',
    modules: [
      {
        id: 'mod-3-1',
        title: '1. Embeddings: Mapping Words to Geometry',
        shortDescription: 'How mathematical vectors capture the semantic meaning and relationships between words.',
        durationMinutes: 14,
        xpReward: 130,
        sections: [
          {
            heading: 'Words as Coordinates in Multi-Dimensional Space',
            content: 'Computers cannot read text directly; they only process numbers. Word Embeddings map words to high-dimensional numeric vectors (lists of 768 or 1536 floating-point numbers). Words with similar meanings or contexts end up close to each other in vector space.',
            analogy: 'Imagine a map of a city where coffee shops are near bakeries, and hardware stores are near lumber yards. An embedding space is a high-dimensional city map of human concepts!',
          },
          {
            heading: 'The Magic of Vector Arithmetic',
            content: 'Because words become geometric coordinates, you can perform vector math: Vector("King") - Vector("Man") + Vector("Woman") ≈ Vector("Queen")! Cosine similarity measures the angle between vectors to see how semantically related two texts are.',
          },
        ],
        quiz: [
          {
            id: 'q3-1',
            question: 'If two word vectors have a Cosine Similarity score close to 1.0, what does this indicate?',
            options: [
              'The words have opposite meanings',
              'The words have highly similar semantic meanings and context',
              'The words have identical character counts',
              'The model encountered a fatal syntax error',
            ],
            correctAnswerIndex: 1,
            explanation: 'Cosine similarity evaluates the angle between vectors. A score of 1 means they point in the same direction, indicating near-identical contextual meaning.',
            mnemonicRetentionTip: 'Cosine near 1 = Parallel thoughts, close friends!',
          },
        ],
        flashcards: [
          {
            id: 'fc-3-1',
            front: 'Self-Attention',
            back: 'A mechanism in Transformers that enables every word in a sentence to look at and weigh the relevance of every other word, understanding context regardless of distance.',
            category: 'Transformers',
          },
        ],
      },
    ],
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision & Visual Intelligence',
    category: 'vision',
    level: 'Intermediate',
    icon: 'Eye',
    imageUrl: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-emerald-500 to-teal-600',
    tagline: 'How computers see, extract features, and classify images with convolutions.',
    description: 'Explore pixel grids, edge detection kernels, convolutional filters, and modern image synthesis concepts.',
    modules: [
      {
        id: 'mod-4-1',
        title: '1. Pixels to Features: Convolutional Kernels',
        shortDescription: 'Discover how small matrix filters glide over images to extract edges, textures, and shapes.',
        durationMinutes: 15,
        xpReward: 140,
        sections: [
          {
            heading: 'Images are Just 2D Grids of Numbers',
            content: 'A grayscale image is a 2D matrix of numbers between 0 (pure black) and 255 (pure white). A color image has 3 color channels: Red, Green, and Blue (RGB).',
            analogy: 'Like creating a mosaic picture out of tiny numbered tiles. Up close you see individual numbers; step back and the portrait emerges.',
          },
          {
            heading: 'The Convolution Filter (Kernel)',
            content: 'A kernel is a small matrix (e.g. 3x3) that slides across the image. By calculating dot products at every position, it highlights vertical edges, horizontal lines, or corners, converting raw pixels into meaningful visual features.',
          },
        ],
        quiz: [
          {
            id: 'q4-1',
            question: 'What is the role of a Convolutional Filter in an image recognition model?',
            options: [
              'To compress the audio file attached to the image',
              'To slide over the pixel grid and detect spatial patterns like edges, curves, and textures',
              'To delete all colors except red',
              'To watermark the photo',
            ],
            correctAnswerIndex: 1,
            explanation: 'Kernels slide across the pixel matrix to extract meaningful local visual features like lines and textures.',
            mnemonicRetentionTip: 'Convolve = Filter through a magnifying glass to find lines!',
          },
        ],
        flashcards: [
          {
            id: 'fc-4-1',
            front: 'Feature Map',
            back: 'The output produced when a convolutional kernel filter slides over an input image, highlighting detected visual features.',
            category: 'Computer Vision',
          },
        ],
        sandbox: {
          type: 'vision_kernel',
          title: 'Interactive 3x3 Convolution Kernel Playground',
          description: 'Choose a filter (Sharpen, Edge Detect, Blur) and watch how the pixel matrix transforms!',
          initialState: {
            filter: 'edge',
          },
        },
      },
    ],
  },
  {
    id: 'responsible-ai-ethics',
    title: 'Responsible AI, Ethics & Privacy in ML',
    category: 'ethics',
    level: 'Beginner',
    icon: 'ShieldCheck',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-amber-500 to-orange-600',
    tagline: 'Build trustworthy AI: mitigate demographic bias, protect user privacy, and ensure algorithmic fairness.',
    description: 'Crucial knowledge for every modern builder: preventing discrimination in datasets, federated learning, and zero-knowledge local storage.',
    modules: [
      {
        id: 'mod-5-1',
        title: '1. Data Bias & Algorithmic Fairness',
        shortDescription: 'How historical inequalities infect training datasets and how to audit models for fairness.',
        durationMinutes: 16,
        xpReward: 140,
        sections: [
          {
            heading: 'Garbage In, Bias Out',
            content: 'AI models do not possess innate moral judgment; they mirror whatever biases are present in their training data. If historical loan approvals favored one demographic over another due to systemic prejudice, an AI trained on that data will perpetuate and amplify that discrimination.',
            analogy: 'If you train a camera only on daylight photos, it will fail in the dark. If you train a medical diagnostic AI only on one demographic, it will misdiagnose other populations.',
          },
          {
            heading: 'Privacy-Preserving AI & Federated Learning',
            content: 'Traditional AI uploads raw user data to a centralized cloud. Federated Learning trains the model directly on user devices (phones, local laptops). Only the mathematical weight updates—not the private personal photos or medical files—are sent back, preserving total privacy.',
          },
        ],
        quiz: [
          {
            id: 'q5-1',
            question: 'What is Federated Learning?',
            options: [
              'A government-mandated ban on machine learning',
              'Training AI models across decentralized local devices without collecting raw user personal data',
              'Selling user data to the highest advertising bidder',
              'Storing all world data in a single giant hard drive',
            ],
            correctAnswerIndex: 1,
            explanation: 'Federated learning enables models to learn collectively while keeping private data securely stored on the user\'s local hardware.',
            mnemonicRetentionTip: 'Federated = Data stays local, only learning travels!',
          },
        ],
        flashcards: [
          {
            id: 'fc-5-1',
            front: 'Differential Privacy',
            back: 'A mathematical technique that adds controlled noise to query results, preventing attackers from reverse-engineering individual identities in a dataset.',
            category: 'Security & Privacy',
          },
        ],
      },
    ],
  },
  {
    id: 'edge-ml-remote',
    title: 'Applied ML: Edge Devices & Offline AI',
    category: 'edge_ml',
    level: 'Applied',
    icon: 'Cpu',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-rose-500 to-pink-600',
    tagline: 'Deploy efficient models on low-power phones, Raspberry Pis, and remote rural environments.',
    description: 'Learn model quantization, pruning, on-device inference, and architectures for communities with zero or intermittent internet.',
    modules: [
      {
        id: 'mod-6-1',
        title: '1. Quantization & On-Device Low-Resource AI',
        shortDescription: 'Compress multi-gigabyte models down to run smoothly on budget smartphones and microcontrollers.',
        durationMinutes: 14,
        xpReward: 130,
        sections: [
          {
            heading: 'Shrinking 32-bit Floats into 8-bit Integers',
            content: 'Most AI models are trained using 32-bit floating point numbers (FP32). Model Quantization converts these weights into 8-bit integers (INT8) or 4-bit weights. This reduces model file size by 75% and speeds up inference by 4x with minimal accuracy loss, allowing students in remote villages to run AI locally without needing an internet connection!',
            analogy: 'Like converting an uncompressed 50MB audio file into a 3MB MP3. The human ear can barely detect the difference, but you can store 15 times more music on your device.',
          },
        ],
        quiz: [
          {
            id: 'q6-1',
            question: 'What is the main benefit of Model Quantization for students in remote areas?',
            options: [
              'It allows AI models to run on affordable low-power devices completely offline without cloud servers',
              'It forces students to buy expensive high-end graphics cards',
              'It deletes the internet completely',
              'It changes the programming language to HTML',
            ],
            correctAnswerIndex: 0,
            explanation: 'Quantization slashes memory and CPU requirements, making powerful AI inference feasible on entry-level mobile devices without active internet.',
            mnemonicRetentionTip: 'Quantize = Shrink the weights, speed the edge!',
          },
        ],
        flashcards: [
          {
            id: 'fc-6-1',
            front: 'Edge AI Inference',
            back: 'Running machine learning predictions locally on physical hardware (phones, smart sensors, laptops) rather than sending data across cloud servers.',
            category: 'Edge Computing',
          },
        ],
      },
    ],
  },
];
