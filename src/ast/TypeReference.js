const javaString = {
    /**
     * Mimics:
     * public static String join(CharSequence delimiter, CharSequence... elements)
     * public static String join(CharSequence delimiter, Iterable<? extends CharSequence> elements)
     */
    join: function(delimiter, elements) {
        if (Array.isArray(elements)) {
            return elements.join(delimiter);
        } else if (elements != null && typeof elements[Symbol.iterator] === 'function') {
            return Array.from(elements).join(delimiter);
        }
        throw new Error('join: elements is not iterable');
    },

    /**
     * Mimics:
     * public static String format(String format, Object... args)
     * (A very simple implementation that replaces %s with the provided arguments.)
     */
    format: function(format, ...args) {
        let i = 0;
        return format.replace(/%s/g, function() {
            return args[i++];
        });
    },

    /**
     * Mimics:
     * public static String valueOf(Object obj)
     * (Also covers many of the overloaded valueOf methods by simply converting to a string.)
     */
    valueOf: function(arg) {
        return String(arg);
    },

    /**
     * Mimics:
     * public static String copyValueOf(char[] data)
     * public static String copyValueOf(char[] data, int offset, int count)
     */
    copyValueOf: function(chars, offset, count) {
        if (!Array.isArray(chars)) {
            throw new Error('copyValueOf: first argument must be an array of characters');
        }
        if (offset === undefined || count === undefined) {
            return chars.join('');
        }
        return chars.slice(offset, offset + count).join('');
    },

    /**
     * Mimics the static field:
     * public static final Comparator<String> CASE_INSENSITIVE_ORDER
     */
    CASE_INSENSITIVE_ORDER: {
        compare: function(s1, s2) {
            s1 = String(s1).toLowerCase();
            s2 = String(s2).toLowerCase();
            if (s1 < s2) return -1;
            if (s1 > s2) return 1;
            return 0;
        }
    }
};

// Create a single mapping for both type references.
const typeMapping = {
    "String": javaString,
    "java.lang.String": javaString
};

export var TypeReference = {
    create: function(position, typeNode, _dims) {
        // Create the node as usual.
        let node = SpelNode.create('typeref', position, typeNode);

        // Override getValue to resolve the type reference using our mapping.
        node.getValue = function(state) {
            // Assume the first child node returns the type name as a string.
            let typeName = node.children[0].getValue(state);
            if (typeMapping.hasOwnProperty(typeName)) {
                return typeMapping[typeName];
            }
            throw {
                name: 'TypeReferenceException',
                message: 'No mapping found for type: ' + typeName
            };
        };

        return node;
    }
};
