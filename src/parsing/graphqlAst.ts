import { ASTNode, visit, DocumentNode, ArgumentNode, ObjectFieldNode } from 'graphql';
import { commonUtils } from '../utils/commonUtils.js';


const setNestedProperty = (obj: Record<string, any>, path: string[], value: unknown) =>  {
  let current = obj;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];

    // If the key doesn't exist or it's not an object, create a new object for that key
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }

    // move to the next level in the nested object
    // it stacks to endless levels
    // for example: step1 - {}, step2 - {a: {}}, step3 - {a: {b: {}}}
    current = current[key];
  }

  // set value to last key in path
  current[path[path.length - 1]] = value;
}


const createPathString = (pathArray: readonly (string | number)[]) => {
  const red = pathArray.reduce((acc: string, key) => {
    if (typeof key === 'number') {
      return `${acc}[${key}]`; // for array indexes
    } else {
      return `${acc}.${key}`; // for object properties
    }
  }, '') as string;

  return red.substring(1); // remove initial dot
}


const getNearestAncestors = (ancestors: ASTNode[]) => {
  const path = []

  // reverse array, because we want to start from the nearest ancestor - from tail
  ancestors.reverse()

  for (let i = 0; i < ancestors.length; i++) {
    const node = ancestors[i]
    if (node.kind === 'Argument' || node.kind === 'ObjectField') {
      path.push(node.name.value)
    }
  }

  return path
}


const setToAncestorsNodes = (node: ArgumentNode | ObjectFieldNode, ancestors: ASTNode[], jsonTree: Record<string, unknown>) => {
  // deep clone of array, we don't want to modify original array or reverse it - it causes problems and destroys AST
  const clone = commonUtils.structuredClone(ancestors)
  const nearestAntcs = getNearestAncestors(clone)
  // revese array back from most deep ancestor to the nearest - from head
  nearestAntcs.reverse()
  // push current node/placeholder for it to the array
  nearestAntcs.push(node.name.value)

  setNestedProperty(jsonTree, nearestAntcs, (node.value as any).value)
}

const toJson = (ast: DocumentNode, jsonTree: Record<string, unknown>) =>{

  visit(ast, {
    OperationDefinition: {
      enter(node) {
        const operationType = node.operation;
        jsonTree[operationType] = {
          selectionSet: []
        };
      }
    },
    Argument: {
      enter(node, key, parent, path, ancestors) {
        const patha = createPathString(path)

        console.log(patha)


        setToAncestorsNodes(node, ancestors as ASTNode[], jsonTree)
      }
    },
    ObjectField: {
      enter(node, key, parent, path, ancestors) {
        const patha = createPathString(path)

        console.log(patha)

        setToAncestorsNodes(node, ancestors as ASTNode[], jsonTree)
      }
    }
  });
}

export const graphqlAst = {
  toJson
}
