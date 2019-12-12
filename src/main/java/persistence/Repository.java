package persistence;

import java.util.Collection;

public interface Repository<T> {

    public Collection<T> findAll();

    public void add(T newObj);

    public void remove(T obj);

    public void remove(String id);

    public boolean has(String id);
}
