# Reactでカスタムフックを作る方法

Reactのカスタムフックは、ロジックを再利用可能な形で抽出する強力な機能です。

## カスタムフックとは

カスタムフックは、`use`で始まる名前を持つJavaScript関数で、Reactの他のフックを内部で使用できます。

## 基本的な例

### useCounterフック

```javascript
import { useState } from 'react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}
```

### 使用例

```javascript
function Counter() {
  const { count, increment, decrement, reset } = useCounter(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>リセット</button>
    </div>
  );
}
```

## より高度な例

### useApiフック

```javascript
import { useState, useEffect } from 'react';

function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}
```

## カスタムフックのメリット

1. **ロジックの再利用**: 複数のコンポーネント間でロジックを共有
2. **関心の分離**: UIとロジックを分離
3. **テストの容易性**: ロジックを個別にテスト可能
4. **可読性の向上**: コンポーネントの役割が明確に

## ベストプラクティス

- `use`で始まる命名規則に従う
- 単一責任の原則を守る
- 適切な依存配列を設定する
- TypeScriptで型安全性を確保する

## まとめ

カスタムフックは、Reactアプリケーションの保守性と再利用性を大幅に向上させる重要な機能です。適切に活用することで、よりクリーンで効率的なコードを書くことができます。