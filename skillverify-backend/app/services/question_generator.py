"""
Question Generator — serves 5 MCQ + 2 Code questions per language
from an in-memory question bank (production would use Firestore).
"""
import random
import uuid
from app.models.assessment import MCQQuestion, MCQOption, CodeQuestion, TestCase, DifficultyLevel

# ─────────────── QUESTION BANK ───────────────
QUESTION_BANK: dict[str, dict] = {
    "python": {
        "mcq": [
            MCQQuestion(
                id="py_mcq_1", language="python", topic="Data Types",
                question="What is the output of `type(1/2)` in Python 3?",
                options=[MCQOption(id="a", text="<class 'int'>"), MCQOption(id="b", text="<class 'float'>"),
                         MCQOption(id="c", text="<class 'complex'>"), MCQOption(id="d", text="<class 'fraction'>")],
                correctAnswer="b", difficulty=DifficultyLevel.easy,
                explanation="In Python 3, dividing two integers with `/` always returns a float.", points=10,
            ),
            MCQQuestion(
                id="py_mcq_2", language="python", topic="List Comprehensions",
                question="Which of the following creates a list of even numbers from 0 to 18?",
                options=[MCQOption(id="a", text="[x for x in range(20) if x % 2 == 0]"),
                         MCQOption(id="b", text="[x for x in range(20) if x % 2 != 0]"),
                         MCQOption(id="c", text="[x for x in range(20) while x % 2 == 0]"),
                         MCQOption(id="d", text="list(x for x in range(20) x % 2 == 0)")],
                correctAnswer="a", difficulty=DifficultyLevel.easy,
                explanation="List comprehension with `if x % 2 == 0` filters even numbers.", points=10,
            ),
            MCQQuestion(
                id="py_mcq_3", language="python", topic="Decorators",
                question="What does the `@staticmethod` decorator do in Python?",
                options=[MCQOption(id="a", text="Makes the method private"),
                         MCQOption(id="b", text="Defines a method that doesn't receive self or cls as first argument"),
                         MCQOption(id="c", text="Makes the method run at class definition time"),
                         MCQOption(id="d", text="Caches the method result")],
                correctAnswer="b", difficulty=DifficultyLevel.medium,
                explanation="`@staticmethod` defines a method that behaves like a regular function within the class namespace.", points=10,
            ),
            MCQQuestion(
                id="py_mcq_4", language="python", topic="Generators",
                question="What is the key difference between `return` and `yield` in Python?",
                options=[MCQOption(id="a", text="`yield` ends function execution immediately"),
                         MCQOption(id="b", text="`yield` produces a value and suspends execution, returning a generator"),
                         MCQOption(id="c", text="`yield` can only be used in class methods"),
                         MCQOption(id="d", text="There is no practical difference")],
                correctAnswer="b", difficulty=DifficultyLevel.medium,
                explanation="`yield` converts a function into a generator — it pauses execution and remembers state.", points=10,
            ),
            MCQQuestion(
                id="py_mcq_5", language="python", topic="GIL",
                question="What does the Python GIL (Global Interpreter Lock) prevent?",
                options=[MCQOption(id="a", text="Memory leaks"),
                         MCQOption(id="b", text="Multiple native threads executing Python bytecodes simultaneously"),
                         MCQOption(id="c", text="Infinite recursion"),
                         MCQOption(id="d", text="Cross-platform incompatibilities")],
                correctAnswer="b", difficulty=DifficultyLevel.hard,
                explanation="The GIL ensures only one Python thread executes bytecode at a time, limiting true parallelism.", points=10,
            ),
            MCQQuestion(
                id="py_mcq_6", language="python", topic="Context Managers",
                question="Which dunder methods must be defined to create a context manager?",
                options=[MCQOption(id="a", text="__open__ and __close__"),
                         MCQOption(id="b", text="__enter__ and __exit__"),
                         MCQOption(id="c", text="__start__ and __end__"),
                         MCQOption(id="d", text="__with__ and __as__")],
                correctAnswer="b", difficulty=DifficultyLevel.medium,
                explanation="`__enter__` is called when entering a `with` block; `__exit__` when leaving it.", points=10,
            ),
            MCQQuestion(
                id="py_mcq_7", language="python", topic="Big-O",
                question="What is the average-case time complexity of Python's `dict` lookup?",
                options=[MCQOption(id="a", text="O(n)"), MCQOption(id="b", text="O(log n)"),
                         MCQOption(id="c", text="O(1)"), MCQOption(id="d", text="O(n²)")],
                correctAnswer="c", difficulty=DifficultyLevel.easy,
                explanation="Python dicts are hash map implementations — average O(1) for lookup.", points=10,
            ),
        ],
        "code": [
            CodeQuestion(
                id="py_code_1", language="python", topic="Algorithms",
                title="Fibonacci Sequence", difficulty=DifficultyLevel.easy,
                description="Write a function `fibonacci(n)` that returns the nth Fibonacci number (0-indexed). fibonacci(0)=0, fibonacci(1)=1.",
                starterCode="def fibonacci(n: int) -> int:\n    # Your solution here\n    pass",
                testCases=[
                    TestCase(input="0", expectedOutput="0", description="Base case 0"),
                    TestCase(input="1", expectedOutput="1", description="Base case 1"),
                    TestCase(input="10", expectedOutput="55", description="fibonacci(10)"),
                ],
                hints=["Consider using dynamic programming or memoization", "Base cases: n=0 returns 0, n=1 returns 1"],
                points=20, timeLimit=300,
            ),
            CodeQuestion(
                id="py_code_2", language="python", topic="Data Structures",
                title="Two Sum", difficulty=DifficultyLevel.medium,
                description="Given a list of integers `nums` and a target integer `target`, return the indices [i, j] of two numbers that add up to target. Assume exactly one solution exists.",
                starterCode="def two_sum(nums: list[int], target: int) -> list[int]:\n    # Your solution here\n    pass",
                testCases=[
                    TestCase(input="[2,7,11,15], 9", expectedOutput="[0, 1]", description="Basic case"),
                    TestCase(input="[3,2,4], 6", expectedOutput="[1, 2]", description="Non-adjacent pair"),
                ],
                hints=["Use a hash map for O(n) solution", "For each element, check if (target - element) exists in the map"],
                points=20, timeLimit=600,
            ),
            CodeQuestion(
                id="py_code_3", language="python", topic="String Manipulation",
                title="Palindrome Check", difficulty=DifficultyLevel.easy,
                description="Write a function `is_palindrome(s)` that returns True if the string `s` is a palindrome (ignoring case and non-alphanumeric characters).",
                starterCode="def is_palindrome(s: str) -> bool:\n    # Your solution here\n    pass",
                testCases=[
                    TestCase(input='"racecar"', expectedOutput="True", description="Simple palindrome"),
                    TestCase(input='"A man, a plan, a canal: Panama"', expectedOutput="True", description="Phrase palindrome"),
                    TestCase(input='"hello"', expectedOutput="False", description="Non-palindrome"),
                ],
                hints=["Clean the string by filtering alphanumeric chars and lowercasing", "Compare string with its reverse"],
                points=20, timeLimit=300,
            ),
            CodeQuestion(
                id="py_code_4", language="python", topic="Data Processing",
                title="Robust Label Encoder", difficulty=DifficultyLevel.medium,
                description="Implement a robust Label Encoder from scratch that handles unseen labels during transform by mapping them to a default 'Unknown' category.",
                starterCode="class RobustEncoder:\n    def __init__(self):\n        pass\n    def fit(self, data):\n        pass\n    def transform(self, data):\n        pass",
                testCases=[TestCase(input="encoder.transform(['new'])", expectedOutput="[0]", description="Handles unseen")],
                hints=["Store mapping in a dictionary. Reserve index 0 for <UNK>"],
                points=20, timeLimit=600,
            ),
            CodeQuestion(
                id="py_code_5", language="python", topic="Data Processing",
                title="Weighted Moving Average", difficulty=DifficultyLevel.medium,
                description="Implement a function to calculate the 'Weighted Moving Average' for a time-series dataset to give more importance to recent data points.",
                starterCode="def weighted_moving_average(data, weights):\n    # Your solution here\n    pass",
                testCases=[TestCase(input="weighted_moving_average([10,20,30], [1,2,3])", expectedOutput="23.33", description="Basic calc")],
                hints=["Multiply each data point by its weight, sum them, and divide by sum of weights"],
                points=20, timeLimit=600,
            ),
            CodeQuestion(
                id="py_code_6", language="python", topic="Machine Learning",
                title="Data Normalizer", difficulty=DifficultyLevel.hard,
                description="Implement a pipeline-safe data normalizer that stores the 'Mean' and 'Std' from the training set and applies them to the test set to prevent data leakage.",
                starterCode="class Normalizer:\n    def fit(self, data):\n        pass\n    def transform(self, data):\n        pass",
                testCases=[TestCase(input="norm.fit([1,2,3]); norm.transform([4])", expectedOutput="[2.44]", description="Transforms properly based on fit history")],
                hints=["Compute mean and std during fit(). During transform(), subtract mean and divide by std"],
                points=20, timeLimit=900,
            ),
        ],
    },
    "javascript": {
        "mcq": [
            MCQQuestion(
                id="js_mcq_1", language="javascript", topic="Closures",
                question="What will `console.log(typeof null)` output in JavaScript?",
                options=[MCQOption(id="a", text='"null"'), MCQOption(id="b", text='"undefined"'),
                         MCQOption(id="c", text='"object"'), MCQOption(id="d", text='"boolean"')],
                correctAnswer="c", difficulty=DifficultyLevel.easy,
                explanation="`typeof null === 'object'` is a well-known JavaScript quirk/bug that persists for legacy reasons.", points=10,
            ),
            MCQQuestion(
                id="js_mcq_2", language="javascript", topic="Event Loop",
                question="What is the output order of: `console.log(1); setTimeout(()=>console.log(2),0); console.log(3)`?",
                options=[MCQOption(id="a", text="1, 2, 3"), MCQOption(id="b", text="1, 3, 2"),
                         MCQOption(id="c", text="2, 1, 3"), MCQOption(id="d", text="3, 1, 2")],
                correctAnswer="b", difficulty=DifficultyLevel.medium,
                explanation="setTimeout is macrotask — runs after current synchronous code. Output: 1, 3, 2.", points=10,
            ),
            MCQQuestion(
                id="js_mcq_3", language="javascript", topic="Promises",
                question="What does `Promise.all([p1, p2, p3])` do when p2 rejects?",
                options=[MCQOption(id="a", text="Continues and resolves with completed promises"),
                         MCQOption(id="b", text="Immediately rejects with p2's rejection reason"),
                         MCQOption(id="c", text="Waits for all to settle, then rejects"),
                         MCQOption(id="d", text="Throws a TypeError")],
                correctAnswer="b", difficulty=DifficultyLevel.medium,
                explanation="Promise.all short-circuits: if any promise rejects, the returned promise immediately rejects.", points=10,
            ),
            MCQQuestion(
                id="js_mcq_4", language="javascript", topic="Prototypes",
                question="What does `Object.create(null)` create?",
                options=[MCQOption(id="a", text="A frozen empty object"),
                         MCQOption(id="b", text="An object with no prototype chain"),
                         MCQOption(id="c", text="An object identical to `{}`"),
                         MCQOption(id="d", text="null")],
                correctAnswer="b", difficulty=DifficultyLevel.hard,
                explanation="Object.create(null) creates a truly bare object with no __proto__ — no inherited methods at all.", points=10,
            ),
            MCQQuestion(
                id="js_mcq_5", language="javascript", topic="Scope",
                question="What is the difference between `let` and `var` regarding hoisting?",
                options=[MCQOption(id="a", text="Both are fully hoisted and initialised"),
                         MCQOption(id="b", text="`var` is hoisted and initialised to undefined; `let` is hoisted but not initialised (TDZ)"),
                         MCQOption(id="c", text="Neither is hoisted"),
                         MCQOption(id="d", text="`let` is hoisted and initialised; `var` is not hoisted")],
                correctAnswer="b", difficulty=DifficultyLevel.medium,
                explanation="`var` declarations are hoisted and initialised to undefined. `let` is hoisted but stays in Temporal Dead Zone until declaration is reached.", points=10,
            ),
            MCQQuestion(
                id="js_mcq_6", language="javascript", topic="Array Methods",
                question="What does `Array.prototype.reduce` return when called on an empty array without an initial value?",
                options=[MCQOption(id="a", text="undefined"), MCQOption(id="b", text="null"),
                         MCQOption(id="c", text="Throws a TypeError"), MCQOption(id="d", text="0")],
                correctAnswer="c", difficulty=DifficultyLevel.medium,
                explanation="Calling reduce on an empty array with no initial value throws: `TypeError: Reduce of empty array with no initial value`.", points=10,
            ),
            MCQQuestion(
                id="js_mcq_7", language="javascript", topic="Modules",
                question="What is the key difference between CommonJS `require` and ES Module `import`?",
                options=[MCQOption(id="a", text="require is async; import is sync"),
                         MCQOption(id="b", text="import is statically analysed at parse time; require is dynamic runtime loading"),
                         MCQOption(id="c", text="They are functionally identical"),
                         MCQOption(id="d", text="import only works in browsers")],
                correctAnswer="b", difficulty=DifficultyLevel.hard,
                explanation="ES Modules are statically analysed, enabling tree-shaking. CommonJS require() runs at runtime dynamically.", points=10,
            ),
        ],
        "code": [
            CodeQuestion(
                id="js_code_1", language="javascript", topic="Functions",
                title="Curry Function", difficulty=DifficultyLevel.medium,
                description="Implement a `curry(fn)` function that converts a function of N arguments into N nested functions of 1 argument each.\ncurry((a,b,c)=>a+b+c)(1)(2)(3) should return 6.",
                starterCode="function curry(fn) {\n  // Your solution here\n}",
                testCases=[
                    TestCase(input="curry((a,b)=>a+b)(1)(2)", expectedOutput="3", description="2-arg curry"),
                    TestCase(input="curry((a,b,c)=>a+b+c)(1)(2)(3)", expectedOutput="6", description="3-arg curry"),
                ],
                hints=["Check if enough arguments have been collected using fn.length", "Recursively return a new function if not enough args yet"],
                points=20, timeLimit=600,
            ),
            CodeQuestion(
                id="js_code_2", language="javascript", topic="Data Structures",
                title="Flatten Nested Array", difficulty=DifficultyLevel.easy,
                description="Write a function `flattenArray(arr)` that deeply flattens a nested array.\nflattenArray([1,[2,[3,[4]]]]) should return [1,2,3,4].",
                starterCode="function flattenArray(arr) {\n  // Your solution here\n}",
                testCases=[
                    TestCase(input="[1,[2,[3]]]", expectedOutput="[1,2,3]", description="3-level nested"),
                    TestCase(input="[1,2,3]", expectedOutput="[1,2,3]", description="Already flat"),
                ],
                hints=["You can use Array.prototype.flat(Infinity) for built-in solution", "Or recursion: check if element is array, then recurse"],
                points=20, timeLimit=300,
            ),
            CodeQuestion(
                id="js_code_3", language="javascript", topic="Higher-Order Functions",
                title="Once Function", difficulty=DifficultyLevel.medium,
                description="Implement a robust 'Once' higher-order function that ensures a function is executed exactly once, handles the result correctly on subsequent calls, and manages the 'this' context of the original function.",
                starterCode="function once(fn) {\n  // Your solution here\n}",
                testCases=[
                    TestCase(input="const f = once(()=>42); [f(), f()]", expectedOutput="[42, 42]", description="Returns same result"),
                ],
                hints=["Use a closure variable `called` and `result`"],
                points=20, timeLimit=600,
            ),
            CodeQuestion(
                id="js_code_4", language="javascript", topic="Async",
                title="Auto-Retry Fetch", difficulty=DifficultyLevel.hard,
                description="Implement an 'Auto-Retry' wrapper for an asynchronous fetch operation that retries a specified number of times with an exponential backoff strategy before finally failing.",
                starterCode="async function retryFetch(url, retries = 3, delay = 1000) {\n  // Your solution here\n}",
                testCases=[
                    TestCase(input="await retryFetch('http://err')", expectedOutput="Throws Error after 3 tries", description="Retries and fails"),
                ],
                hints=["Use a try/catch inside a recursive async function or loop", "Multiply delay by 2 on each retry"],
                points=20, timeLimit=900,
            ),
            CodeQuestion(
                id="js_code_5", language="javascript", topic="Data Structures",
                title="Safe Flatten Stack", difficulty=DifficultyLevel.hard,
                description="Implement a safe Flatten function for nested arrays that handles deep nesting without causing a Stack Overflow for very large arrays. DO NOT use Array.prototype.flat.",
                starterCode="function flatten(arr) {\n  // Your solution here\n}",
                testCases=[
                    TestCase(input="flatten([1,[2,3],4])", expectedOutput="[1,2,3,4]", description="Flattens correctly"),
                ],
                hints=["Use an explicit stack instead of recursion"],
                points=20, timeLimit=900,
            ),
        ],
    },
    "typescript": {
        "mcq": [
            MCQQuestion(
                id="ts_mcq_1", language="typescript", topic="Types",
                question="What is the difference between `interface` and `type` in TypeScript?",
                options=[MCQOption(id="a", text="They are completely identical"),
                         MCQOption(id="b", text="type can represent primitives/unions/tuples; interface is better for object shapes and declaration merging"),
                         MCQOption(id="c", text="interface is deprecated"),
                         MCQOption(id="d", text="type cannot be extended")],
                correctAnswer="b", difficulty=DifficultyLevel.medium,
                explanation="Both can describe object shapes. `type` can alias any type. `interface` supports declaration merging and is preferred for OOP.", points=10,
            ),
            MCQQuestion(
                id="ts_mcq_2", language="typescript", topic="Generics",
                question="What does `T extends keyof U` mean in a generic constraint?",
                options=[MCQOption(id="a", text="T must be a subclass of U"),
                         MCQOption(id="b", text="T must be one of the property keys of type U"),
                         MCQOption(id="c", text="T must be assignable to the values of U"),
                         MCQOption(id="d", text="T must equal U")],
                correctAnswer="b", difficulty=DifficultyLevel.hard,
                explanation="`keyof U` produces a union of all known public property names of U. `T extends keyof U` constrains T to be one of those keys.", points=10,
            ),
        ] + [],  # Add more if needed
        "code": [
            CodeQuestion(
                id="ts_code_1", language="typescript", topic="Generics",
                title="Generic Stack", difficulty=DifficultyLevel.medium,
                description="Implement a generic `Stack<T>` class with `push(item: T)`, `pop(): T | undefined`, and `peek(): T | undefined` methods.",
                starterCode="class Stack<T> {\n  private items: T[] = [];\n\n  push(item: T): void {\n    // Your code\n  }\n\n  pop(): T | undefined {\n    // Your code\n  }\n\n  peek(): T | undefined {\n    // Your code\n  }\n}",
                testCases=[
                    TestCase(input="stack.push(1); stack.push(2); stack.pop()", expectedOutput="2", description="LIFO pop"),
                    TestCase(input="stack.peek() after push(42)", expectedOutput="42", description="Peek without pop"),
                ],
                hints=["Use an array as backing store", "pop() removes and returns last element; peek() just reads it"],
                points=20, timeLimit=600,
            ),
        ],
    },
    "html": {
        "mcq": [
            MCQQuestion(
                id="html_mcq_1", language="html", topic="Accessibility",
                question="What is the purpose of the 'alt' attribute?",
                options=[MCQOption(id="a", text="To display tooltip text"), MCQOption(id="b", text="For screen readers and broken image fallback"), MCQOption(id="c", text="Styling"), MCQOption(id="d", text="SEO solely")],
                correctAnswer="b", difficulty=DifficultyLevel.easy, explanation="", points=10
            )
        ],
        "code": [
            CodeQuestion(
                id="html_code_1", language="html", topic="Performance",
                title="High-Performance Image Gallery", difficulty=DifficultyLevel.medium,
                description="Design a high-performance image gallery using native lazy loading and 'aspect-ratio' to prevent Cumulative Layout Shift (CLS) during page load.",
                starterCode="<!-- Write your HTML image tag solution here -->",
                testCases=[TestCase(input="HTML parsing", expectedOutput="Contains loading='lazy', width, height, and aspect-ratio", description="Prevents CLS")],
                hints=["Set explicit width and height attributes", "Use inline style for aspect ratio"],
                points=20, timeLimit=600,
            ),
            CodeQuestion(
                id="html_code_2", language="html", topic="Security",
                title="Honeypot Form Pattern", difficulty=DifficultyLevel.medium,
                description="Implement a 'Honeypot' pattern for a registration form to detect and prevent automated bot submissions without affecting user experience.",
                starterCode="<!-- Write your Form HTML solution here -->",
                testCases=[TestCase(input="HTML Parsing", expectedOutput="Contains a hidden trap field", description="Hidden field traps bots")],
                hints=["Hide the field using CSS display:none or off-screen positioning", "Do not use type='hidden' as bots ignore it sometimes"],
                points=20, timeLimit=600,
            ),
            CodeQuestion(
                id="html_code_3", language="html", topic="Accessibility",
                title="Accessible Data Table", difficulty=DifficultyLevel.hard,
                description="Construct a data table with fixed headers and scrollable body that remains accessible to screen readers using ARIA scopes.",
                starterCode="<!-- Write your Accessible Table HTML solution here -->",
                testCases=[TestCase(input="HTML Parsing", expectedOutput="Contains role='region', tabindex, th scopes", description="Accessible and scrollable")],
                hints=["Wrap table in a div with role='region' and an aria label", "Use scope='col' and scope='row'"],
                points=20, timeLimit=600,
            ),
        ],
    },
    "css": {
        "mcq": [
            MCQQuestion(
                id="css_mcq_1", language="css", topic="Layout",
                question="Which property controls the main-axis alignment in flexbox?",
                options=[MCQOption(id="a", text="align-items"), MCQOption(id="b", text="justify-content"), MCQOption(id="c", text="flex-direction"), MCQOption(id="d", text="align-content")],
                correctAnswer="b", difficulty=DifficultyLevel.easy, explanation="", points=10
            )
        ],
        "code": [
            CodeQuestion(
                id="css_code_1", language="css", topic="Design",
                title="Glassmorphism Effect", difficulty=DifficultyLevel.medium,
                description="Create a 'Glassmorphism' effect with a blurry background that ensures text remains readable and the effect works on browsers that don't support 'backdrop-filter'.",
                starterCode="/* Write your CSS rules for .card here */\n.card {}",
                testCases=[TestCase(input="CSS Parsing", expectedOutput="Contains @supports and backdrop-filter", description="Graceful degradation")],
                hints=["Provide a solid semi-transparent background fallback", "Use @supports (backdrop-filter: blur)"],
                points=20, timeLimit=600,
            ),
            CodeQuestion(
                id="css_code_2", language="css", topic="Typography",
                title="Multi-line Text Truncation", difficulty=DifficultyLevel.medium,
                description="Implement a multi-line text truncation (Ellipsis) after exactly 3 lines of text using modern CSS properties.",
                starterCode="/* Write your CSS rules for .text here */\n.text {}",
                testCases=[TestCase(input="CSS Parsing", expectedOutput="Contains -webkit-line-clamp", description="Truncates securely")],
                hints=["Use display: -webkit-box", "Set -webkit-box-orient and -webkit-line-clamp"],
                points=20, timeLimit=600,
            ),
            CodeQuestion(
                id="css_code_3", language="css", topic="Layouts",
                title="Responsive Square Grid", difficulty=DifficultyLevel.easy,
                description="Build a fully responsive square grid item (maintain 1:1 aspect ratio) regardless of the content inside or the container width.",
                starterCode="/* Write your CSS rules for .item here */\n.item {}",
                testCases=[TestCase(input="CSS Parsing", expectedOutput="Contains aspect-ratio", description="Maintains 1:1 ratio")],
                hints=["The aspect-ratio property is perfect for this"],
                points=20, timeLimit=300,
            ),
        ],
    },
    "java": {
        "mcq": [
            MCQQuestion(
                id="java_mcq_1", language="java", topic="OOP",
                question="What is the result of calling `equals()` on two different String objects with the same content in Java?",
                options=[MCQOption(id="a", text="false, because they are different objects"),
                         MCQOption(id="b", text="true, because String.equals() compares content"),
                         MCQOption(id="c", text="Throws NullPointerException"),
                         MCQOption(id="d", text="Depends on JVM implementation")],
                correctAnswer="b", difficulty=DifficultyLevel.easy,
                explanation="String.equals() is overridden to compare character sequences, not references. Use == for reference equality.", points=10,
            ),
        ],
        "code": [
            CodeQuestion(
                id="java_code_1", language="java", topic="Algorithms",
                title="Reverse a String", difficulty=DifficultyLevel.easy,
                description="Write a method `reverseString(String s)` that returns the reversed string without using StringBuilder.reverse().",
                starterCode="public class Solution {\n    public static String reverseString(String s) {\n        // Your solution here\n        return \"\";\n    }\n}",
                testCases=[
                    TestCase(input='"hello"', expectedOutput='"olleh"', description="Basic reverse"),
                    TestCase(input='"SkillVerify"', expectedOutput='"yfirevllikS"', description="Mixed case"),
                ],
                hints=["Use a char array and swap indices", "Or iterate from end to start"],
                points=20, timeLimit=300,
            ),
        ],
    },
    "cpp": {
        "mcq": [
            MCQQuestion(
                id="cpp_mcq_1", language="cpp", topic="Pointers",
                question="What does the `&` operator mean in C++?",
                options=[MCQOption(id="a", text="Dereference"), MCQOption(id="b", text="Address-of"), MCQOption(id="c", text="Pointer type"), MCQOption(id="d", text="Bitwise OR")],
                correctAnswer="b", difficulty=DifficultyLevel.easy, explanation="", points=10
            )
        ],
        "code": [
            CodeQuestion(
                id="cpp_code_1", language="cpp", topic="Concurrency",
                title="Thread-Safe Singleton", difficulty=DifficultyLevel.hard,
                description="Implement a Thread-Safe Singleton pattern using C++11 'Double-Checked Locking' to ensure only one instance of a Resource Manager exists.",
                starterCode="class Singleton {\npublic:\n    static Singleton* getInstance() {\n        // Your solution here\n    }\n};",
                testCases=[TestCase(input="Singleton::getInstance()", expectedOutput="Same memory address across threads", description="Thread safe instantiation")],
                hints=["Use std::mutex and std::lock_guard", "Check if instance is null, lock, then check again"],
                points=20, timeLimit=900,
            ),
            CodeQuestion(
                id="cpp_code_2", language="cpp", topic="Data Structures",
                title="LCA in BST", difficulty=DifficultyLevel.hard,
                description="Design an efficient algorithm to find the 'Lowest Common Ancestor' (LCA) in a Binary Search Tree (BST) without using recursion to save stack memory.",
                starterCode="Node* lowestCommonAncestor(Node* root, int p, int q) {\n    // Your solution here\n}",
                testCases=[TestCase(input="root=[6,2,8], p=2, q=8", expectedOutput="6", description="Finds LCA")],
                hints=["Use a while loop", "If both p and q are smaller than root, go left. If both are greater, go right."],
                points=20, timeLimit=600,
            ),
            CodeQuestion(
                id="cpp_code_3", language="cpp", topic="Advanced Data Structures",
                title="Segment Tree with Lazy Propagation", difficulty=DifficultyLevel.hard,
                description="Implement a 'Segment Tree' with Lazy Propagation to handle efficient range updates and range sum queries in O(log N) time.",
                starterCode="void updateRange(int node, int start, int end, int l, int r, int val) {\n    // Your solution here\n}",
                testCases=[TestCase(input="updateRange(1,0,5,1,3,10)", expectedOutput="Applies updates efficiently", description="Lazy propagation")],
                hints=["Update current node with pending lazy values first", "If fully in range, update node and mark children lazy. If partial, split query."],
                points=20, timeLimit=900,
            ),
        ]
    }
}

# Fallback for languages not in bank
GENERIC_FALLBACK_MCQ = [
    MCQQuestion(
        id="gen_mcq_1", language="general", topic="Programming Concepts",
        question="What is the time complexity of binary search?",
        options=[MCQOption(id="a", text="O(n)"), MCQOption(id="b", text="O(log n)"),
                 MCQOption(id="c", text="O(n²)"), MCQOption(id="d", text="O(1)")],
        correctAnswer="b", difficulty=DifficultyLevel.easy,
        explanation="Binary search halves the search space each step: O(log n) time complexity.", points=10,
    ),
    MCQQuestion(
        id="gen_mcq_2", language="general", topic="Data Structures",
        question="Which data structure uses LIFO (Last In, First Out) ordering?",
        options=[MCQOption(id="a", text="Queue"), MCQOption(id="b", text="Linked List"),
                 MCQOption(id="c", text="Stack"), MCQOption(id="d", text="Heap")],
        correctAnswer="c", difficulty=DifficultyLevel.easy,
        explanation="Stacks follow LIFO — the last element added is the first to be removed.", points=10,
    ),
    MCQQuestion(
        id="gen_mcq_3", language="general", topic="Algorithms",
        question="What is 'Big-O notation' used to describe?",
        options=[MCQOption(id="a", text="Memory address spaces"),
                 MCQOption(id="b", text="Upper bound of algorithm growth rate"),
                 MCQOption(id="c", text="Exact runtime in seconds"),
                 MCQOption(id="d", text="Number of code lines")],
        correctAnswer="b", difficulty=DifficultyLevel.easy,
        explanation="Big-O describes the worst-case upper bound on how an algorithm's runtime grows with input size.", points=10,
    ),
    MCQQuestion(
        id="gen_mcq_4", language="general", topic="Networking",
        question="What does REST stand for?",
        options=[MCQOption(id="a", text="Reactive Event State Transfer"),
                 MCQOption(id="b", text="Representational State Transfer"),
                 MCQOption(id="c", text="Remote Execution Service Technology"),
                 MCQOption(id="d", text="Real-time Event Streaming Technology")],
        correctAnswer="b", difficulty=DifficultyLevel.easy,
        explanation="REST (Representational State Transfer) is an architectural style for distributed hypermedia systems.", points=10,
    ),
    MCQQuestion(
        id="gen_mcq_5", language="general", topic="Databases",
        question="What does `ACID` stand for in databases?",
        options=[MCQOption(id="a", text="Atomicity, Consistency, Isolation, Durability"),
                 MCQOption(id="b", text="Array, Class, Index, Dictionary"),
                 MCQOption(id="c", text="Async, Concurrent, Indexed, Distributed"),
                 MCQOption(id="d", text="Automatic, Committed, Integrated, Dynamic")],
        correctAnswer="a", difficulty=DifficultyLevel.medium,
        explanation="ACID properties guarantee database transactions are processed reliably.", points=10,
    ),
]


def get_questions_for_languages(languages: list[str]) -> list[dict]:
    """
    For each language: select 5 random MCQs + 2 random Code questions.
    Falls back to generic questions for unknown languages.
    """
    result = []
    for lang in languages:
        lang_lower = lang.lower()
        bank = QUESTION_BANK.get(lang_lower)

        if bank:
            mcqs = random.sample(bank["mcq"], min(5, len(bank["mcq"])))
            codes = random.sample(bank["code"], min(2, len(bank["code"])))
        else:
            mcqs = random.sample(GENERIC_FALLBACK_MCQ, min(5, len(GENERIC_FALLBACK_MCQ)))
            mcqs = [q.model_copy(update={"language": lang, "id": f"{lang}_{q.id}"}) for q in mcqs]
            codes = []

        for q in mcqs:
            result.append(q.model_dump())
        for q in codes:
            result.append(q.model_dump())

    return result
