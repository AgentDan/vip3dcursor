import { useState, useMemo, useCallback } from 'react';
import EnvDescription from '../EnvEditor/EnvDescription';

/**
 * Компонент для визуализации описаний из env параметров
 * Показывает HTML-элементы с иконками в позициях описаний
 * При клике открывает только одно описание (остальные закрываются)
 */
export function DescriptionVisualizer({ envParams }) {
  // Состояние открытого описания: только одно может быть открыто одновременно
  const [openDescriptionName, setOpenDescriptionName] = useState(null);

  // Фильтруем описания из envParams
  const descriptions = useMemo(() => {
    if (!envParams || !Array.isArray(envParams)) return [];
    return envParams.filter(param => param.type === 'description' && param.name && param.position);
  }, [envParams]);

  // Обработчик клика по описанию: открывает только выбранное, закрывает все остальные
  const handleClickDescription = useCallback((name) => {
    setOpenDescriptionName(prev => {
      // Если кликнули на уже открытое описание - закрываем его
      if (prev === name) {
        return null;
      }
      // Иначе открываем новое (остальные автоматически закроются)
      return name;
    });
  }, []);

  // Если описаний нет, ничего не рендерим
  if (!descriptions || descriptions.length === 0) {
    return null;
  }

  return (
    <>
      {descriptions.map((item, index) => {
        const clickDescript = openDescriptionName === item.name;
        return (
          <EnvDescription
            key={item.name || index}
            item={item}
            clickDescript={clickDescript}
            handleClickDescription={handleClickDescription}
          />
        );
      })}
    </>
  );
}

