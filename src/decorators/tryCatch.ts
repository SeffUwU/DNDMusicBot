export default function Catch(target?: any, key?: any, descriptor?: any) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      console.warn((error as Error).message);
    }
  };

  return descriptor;
}
