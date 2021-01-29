import styles from './index.css';
import data from './data.json';

export default function() {
  const renderContent = () =>{
    const blocks = data.map(d =>{
      const list = d.list.map((m,i) =>{
        if(m.icon){
          return(
            <a href={m.url} target="_blank" key={i} 
              className={styles.url} title={m.name}>
              <img src={`./icons/${m.icon}`}  key={i} width="20"/>
            </a>)
        }else{
          return (
          <a href={m.url} target="_blank" key={i} className={styles.url}>
            {m.name}
          </a>)
        }
      });
      return (<div className={styles.blocks}  key={d.key}>
        <span className={styles.title}>
          {d.title}
        </span>
        <>{list}</>
      </div>)

    });
    return blocks;
  }
  return (
    <div className={styles.wrap}>
      {renderContent()}
    </div>
  );
}
