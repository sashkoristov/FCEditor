package persistence;

import java.util.Collection;

public interface Repository<T> {

    public Collection<T> findAll();

    public T findOne(String id);

    public void add(T obj);

    public void remove(T obj);

    public void remove(String id);

    public void update(T obj);
}
