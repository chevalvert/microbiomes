// Wait for DOM to be completely loaded
export default async () =>
  document.readyState === 'complete' ||
  new Promise(resolve => {
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') resolve()
    }
  })
